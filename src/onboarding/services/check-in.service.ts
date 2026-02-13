import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CheckInSubmissionDto } from '../dto/check-in-submission.dto';
import { CHECK_IN_QUESTIONS, CheckInQuestion } from '../constants/check-in-questions';
import { StageEnum } from '../enums/stage.enum';
import { CheckInCategoryEnum } from '../enums/check-in-category.enum';
import { TrafficLightEnum } from '../enums/traffic-light.enum';

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current week number and year for consistency
   */
  private getWeekInfo(): { weekNumber: number; year: number } {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    return { weekNumber, year: now.getFullYear() };
  }

  /**
   * Get Monday of current week (for weekStartDate)
   */
  private getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  /**
   * Calculate traffic light based on score (1.0-5.0)
   */
  private getTrafficLight(score: number): TrafficLightEnum {
    if (score >= 3.8) return TrafficLightEnum.GREEN;
    if (score >= 2.5) return TrafficLightEnum.YELLOW;
    return TrafficLightEnum.RED;
  }

  /**
   * Calculate category score from ratings
   * Takes 2 ratings (1-5 each), sums them (2-10), normalizes to 1.0-5.0
   */
  private calculateCategoryScore(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    if (ratings.length < 2) {
      // Partial score: just average what we have
      return ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }
    // Take first 2 ratings
    const sum = ratings[0] + ratings[1];
    // Normalize: (sum - 2) / 8 + 1 = (sum - 2 + 8) / 8 = (sum + 6) / 8
    // But simpler: (sum / 10) * 5 + adjustment
    // Actually simpler formula: (sum - 2) / 8 + 1
    const normalized = (sum - 2) / 8 + 1;
    return parseFloat(normalized.toFixed(2));
  }

  /**
   * GET /check-ins/status
   * Check if user has pending check-in for current week
   */
  async getCheckInStatus(userId: string) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding || !onboarding.is_onboarding_completed) {
      throw new BadRequestException('Onboarding must be completed first');
    }

    if (!onboarding.currentStage) {
      throw new BadRequestException('No current stage found');
    }

    const { weekNumber, year } = this.getWeekInfo();

    // Get all questions for current stage
    const questionsForStage = CHECK_IN_QUESTIONS[onboarding.currentStage];
    const allQuestions: CheckInQuestion[] = [];

    for (const category of Object.values(CheckInCategoryEnum)) {
      const categoryQuestions = questionsForStage[category] || [];
      allQuestions.push(...categoryQuestions);
    }

    // Check which questions have been answered this week
    const answeredThisWeek = await this.prisma.checkInResponse.findMany({
      where: {
        userId,
        weekNumber,
        year,
      },
    });

    const answeredQuestionIds = new Set(answeredThisWeek.map((r) => r.questionId));

    const pendingQuestions = allQuestions.filter(
      (q) => !answeredQuestionIds.has(q.id),
    );

    return {
      hasCompletedThisWeek: pendingQuestions.length === 0,
      totalQuestions: allQuestions.length,
      answeredCount: answeredThisWeek.length,
      pendingCount: pendingQuestions.length,
      pendingQuestions: pendingQuestions.map((q) => ({
        id: q.id,
        category: q.category,
        questionText: q.questionText,
      })),
      stage: onboarding.currentStage,
    };
  }

  /**
   * POST /check-ins/submit
   * Submit check-in responses and calculate scores
   */
  async submitCheckIn(userId: string, dto: CheckInSubmissionDto) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding || !onboarding.is_onboarding_completed) {
      throw new BadRequestException('Onboarding must be completed first');
    }

    if (!onboarding.currentStage) {
      throw new BadRequestException('No current stage found');
    }

    const { weekNumber, year } = this.getWeekInfo();

    // Save each answer
    const savedResponses = await Promise.all(
      dto.answers.map((answer) =>
        this.prisma.checkInResponse.upsert({
          where: {
            userId_weekNumber_year_category_questionId: {
              userId,
              weekNumber,
              year,
              category: this.getCategoryForQuestion(answer.questionId),
              questionId: answer.questionId,
            },
          },
          create: {
            userId,
            onboardingResponseId: onboarding.id,
            stage: onboarding.currentStage as StageEnum,
            category: this.getCategoryForQuestion(answer.questionId),
            questionId: answer.questionId,
            rating: answer.rating,
            weekNumber,
            year,
          },
          update: {
            rating: answer.rating,
            updatedAt: new Date(),
          },
        }),
      ),
    );

    // Calculate scores per category
    const categoryScores = await this.calculateWeeklyScores(
      userId,
      onboarding.id,
      onboarding.currentStage as StageEnum,
      weekNumber,
      year,
    );

    // Return summary
    return {
      message: 'Check-in registered successfully',
      weekNumber,
      year,
      answersSubmitted: savedResponses.length,
      categoryScores,
    };
  }

  /**
   * Helper: Get category for a question ID
   */
  private getCategoryForQuestion(questionId: string): CheckInCategoryEnum {
    if (questionId.includes('_work_')) return CheckInCategoryEnum.WORK;
    if (questionId.includes('_wellbeing_')) return CheckInCategoryEnum.WELLBEING;
    if (questionId.includes('_home_')) return CheckInCategoryEnum.HOME;
    throw new BadRequestException(`Unknown question: ${questionId}`);
  }

  /**
   * Helper: Calculate and store weekly scores per category
   */
  private async calculateWeeklyScores(
    userId: string,
    onboardingId: string,
    stage: StageEnum,
    weekNumber: number,
    year: number,
  ) {
    const categories = Object.values(CheckInCategoryEnum);
    const scores = [];

    for (const category of categories) {
      // Get all ratings for this category this week
      const ratings = await this.prisma.checkInResponse.findMany({
        where: {
          userId,
          weekNumber,
          year,
          category,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (ratings.length === 0) continue;

      const ratingValues = ratings.map((r) => r.rating);
      const score = this.calculateCategoryScore(ratingValues);
      const trafficLight = this.getTrafficLight(score);

      // Store or update the score
      const scoreRecord = await this.prisma.checkInScore.upsert({
        where: {
          userId_weekNumber_year_scoreType: {
            userId,
            weekNumber,
            year,
            scoreType: category.toLowerCase(),
          },
        },
        create: {
          userId,
          onboardingResponseId: onboardingId,
          stage,
          scoreType: category.toLowerCase(),
          score: new Decimal(score),
          trafficLight,
          weekStartDate: this.getMondayOfWeek(new Date()),
          weekNumber,
          year,
        },
        update: {
          score: new Decimal(score),
          trafficLight,
          updatedAt: new Date(),
        },
      });

      scores.push({
        category: category.toLowerCase(),
        score: parseFloat(score.toString()),
        trafficLight,
      });
    }

    return scores;
  }

  /**
   * GET /check-ins/history
   * Return historical check-in scores
   */
  async getCheckInHistory(userId: string, limit = 10, offset = 0) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    const scores = await this.prisma.checkInScore.findMany({
      where: { userId },
      orderBy: { weekStartDate: 'desc' },
      skip: offset,
      take: limit,
    });

    const totalCount = await this.prisma.checkInScore.count({
      where: { userId },
    });

    return {
      totalCount,
      limit,
      offset,
      scores: scores.map((s) => ({
        weekNumber: s.weekNumber,
        year: s.year,
        weekStartDate: s.weekStartDate,
        scoreType: s.scoreType,
        score: parseFloat(s.score.toString()),
        trafficLight: s.trafficLight,
      })),
    };
  }

  /**
   * GET /check-ins/:week/score
   * Get score for specific week
   */
  async getCheckInScore(userId: string, weekNumber: number, year?: number) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding not found');
    }

    const queryYear = year || new Date().getFullYear();

    const scores = await this.prisma.checkInScore.findMany({
      where: {
        userId,
        weekNumber,
        year: queryYear,
      },
    });

    if (scores.length === 0) {
      throw new NotFoundException(`No check-in found for week ${weekNumber}, year ${queryYear}`);
    }

    return {
      weekNumber,
      year: queryYear,
      scores: scores.map((s) => ({
        scoreType: s.scoreType,
        score: parseFloat(s.score.toString()),
        trafficLight: s.trafficLight,
      })),
    };
  }

  /**
   * GET /check-ins/questions/:stage
   * Get all questions for a given stage
   */
  async getCheckInQuestions(stage: string) {
    const stageKey = stage.toUpperCase() as StageEnum;

    if (!CHECK_IN_QUESTIONS[stageKey]) {
      throw new BadRequestException(`Unknown stage: ${stage}`);
    }

    const questions = CHECK_IN_QUESTIONS[stageKey];
    const result = [];

    for (const category of Object.values(CheckInCategoryEnum)) {
      const categoryQuestions = questions[category] || [];
      result.push(...categoryQuestions);
    }

    return {
      stage,
      totalQuestions: result.length,
      questions: result.map((q) => ({
        id: q.id,
        category: q.category,
        questionText: q.questionText,
        order: q.order,
      })),
    };
  }

  /**
   * Check if user has already completed check-in this week
   */
  async hasCompletedCheckInThisWeek(userId: string): Promise<boolean> {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding || !onboarding.currentStage) {
      return false;
    }

    const { weekNumber, year } = this.getWeekInfo();

    const questionsForStage = CHECK_IN_QUESTIONS[onboarding.currentStage];
    const totalQuestions = Object.values(questionsForStage)
      .reduce((sum, categoryQuestions) => sum + ((categoryQuestions as any)?.length || 0), 0);

    if (totalQuestions === 0) return false;

    const answeredCount = await this.prisma.checkInResponse.count({
      where: {
        userId,
        weekNumber,
        year,
      },
    });

    return answeredCount >= totalQuestions;
  }
}

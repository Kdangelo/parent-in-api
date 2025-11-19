import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingStartDto } from './dto/onboarding-start.dto';
import { StageDetailsDto } from './dto/stage-details.dto';
import { LearningTopicsDto } from './dto/learning-topics.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { StageTransitionDto } from './dto/stage-transition.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /onboarding/status
   * Devuelve estado del onboarding
   */
  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isOnboardingCompleted: true },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    return {
      isOnboardingCompleted: user.isOnboardingCompleted,
      message: user.isOnboardingCompleted
        ? 'Onboarding completado'
        : 'Onboarding pendiente',
    };
  }

  /**
   * POST /onboarding/start
   * Paso 1: Guardar identidad, familia y etapa
   */
  async start(userId: string, dto: OnboardingStartDto) {
    const onboarding = await this.prisma.onboardingResponses.upsert({
      where: { userId },
      create: {
        userId,
        userRole: dto.userRole,
        familyType: dto.familyType,
        familyTypeOther: dto.familyTypeOther || null,
        currentStage: dto.currentStage,
      },
      update: {
        userRole: dto.userRole,
        familyType: dto.familyType,
        familyTypeOther: dto.familyTypeOther || null,
        currentStage: dto.currentStage,
      },
    });

    return {
      message: 'Paso 1 completado',
      data: onboarding,
    };
  }

  /**
   * PUT /onboarding/stage-details
   * Paso 2: Guardar datos específicos según etapa + necesidades de apoyo
   */
  async updateStageDetails(userId: string, dto: StageDetailsDto) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      throw new BadRequestException('Debes completar Paso 1 primero');
    }

    // Actualizar datos específicos por etapa
    const updateData: any = {};

    if (dto.trimester) updateData.trimester = dto.trimester;
    if (dto.estimatedDueDate) updateData.estimatedDueDate = new Date(dto.estimatedDueDate);
    if (dto.babyBirthDate) updateData.babyBirthDate = new Date(dto.babyBirthDate);
    if (dto.licenseDuration) updateData.licenseDuration = dto.licenseDuration;
    if (dto.licenseDurationOther) updateData.licenseDurationOther = dto.licenseDurationOther;
    if (dto.workModality) updateData.workModality = dto.workModality;
    if (dto.workModalityOther) updateData.workModalityOther = dto.workModalityOther;
    if (dto.preLicenseSupportNeeds) updateData.preLicenseSupportNeeds = dto.preLicenseSupportNeeds;
    if (dto.licenseSupportNeeds) updateData.licenseSupportNeeds = dto.licenseSupportNeeds;
    if (dto.postLicenseSupportNeeds) updateData.postLicenseSupportNeeds = dto.postLicenseSupportNeeds;

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: updateData,
    });

    return {
      message: 'Paso 2 completado',
      data: updated,
    };
  }

  /**
   * PUT /onboarding/learning-topics
   * Paso 3: Guardar temas de aprendizaje y MARCAR onboarding como completado
   */
  async finalize(userId: string, dto: LearningTopicsDto) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      throw new BadRequestException('Debes completar Paso 1 primero');
    }

    // Actualizar learning topics y marcar como completado
    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: {
        learningTopics: dto.learningTopics,
        is_onboarding_completed: true,
        completedAt: new Date(),
      },
    });

    // Actualizar User.isOnboardingCompleted
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboardingCompleted: true },
    });

    return {
      message: '¡Bienvenida! Onboarding completado',
      data: updated,
    };
  }

  /**
   * GET /onboarding/data
   * Obtener datos guardados del onboarding
   */
  async findByUserId(userId: string) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding no encontrado');
    }

    return onboarding;
  }

  /**
   * PATCH /onboarding/me
   * Editar datos generales (después de completar onboarding)
   */
  async update(userId: string, dto: UpdateOnboardingDto) {
    const updateData: any = {};

    if (dto.userRole) updateData.userRole = dto.userRole;
    if (dto.familyType) updateData.familyType = dto.familyType;
    if (dto.familyTypeOther !== undefined) updateData.familyTypeOther = dto.familyTypeOther;
    if (dto.learningTopics) updateData.learningTopics = dto.learningTopics;

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: updateData,
    });

    return {
      message: 'Datos actualizados',
      data: updated,
    };
  }

  /**
   * POST /onboarding/transition
   * Cambiar de etapa (después de completar onboarding)
   */
  async transitionStage(userId: string, dto: StageTransitionDto) {
    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: {
        currentStage: dto.currentStage,
        updatedAt: new Date(),
      },
    });

    return {
      message: `Etapa cambiada a ${dto.currentStage}`,
      data: updated,
    };
  }
}


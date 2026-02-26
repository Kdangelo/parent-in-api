-- CreateEnum
CREATE TYPE "OrganizationSizeEnum" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "OrganizationStageEnum" AS ENUM ('STARTUP', 'SCALING', 'MATURE');

-- CreateEnum
CREATE TYPE "CheckInCategoryEnum" AS ENUM ('WORK', 'WELLBEING', 'HOME');

-- CreateEnum
CREATE TYPE "TrafficLightEnum" AS ENUM ('RED', 'YELLOW', 'GREEN');

-- AlterTable
ALTER TABLE "onboarding_responses" ADD COLUMN     "areasOfSpecialization" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "currentInitiatives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "cvUrl" TEXT,
ADD COLUMN     "desiredInitiatives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "emotionalSupportScore" INTEGER,
ADD COLUMN     "estimatedPricePerSession" DECIMAL(65,30),
ADD COLUMN     "flexibilityScore" INTEGER,
ADD COLUMN     "genderDistribution" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "maternityLeaveDays" TEXT,
ADD COLUMN     "motivation" TEXT,
ADD COLUMN     "organizationIndustry" TEXT,
ADD COLUMN     "organizationName" TEXT,
ADD COLUMN     "organizationRole" TEXT,
ADD COLUMN     "organizationSize" "OrganizationSizeEnum",
ADD COLUMN     "organizationStage" "OrganizationStageEnum",
ADD COLUMN     "organizationalChallenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "organizationalMaturity" TEXT,
ADD COLUMN     "paternityLeaveDays" TEXT,
ADD COLUMN     "percentageFathers" TEXT,
ADD COLUMN     "percentageMothers" TEXT,
ADD COLUMN     "workLifeBalanceScore" INTEGER;

-- CreateTable
CREATE TABLE "check_in_questions" (
    "id" TEXT NOT NULL,
    "stage" "StageEnum" NOT NULL,
    "category" "CheckInCategoryEnum" NOT NULL,
    "questionText" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_in_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_in_responses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "onboardingResponseId" TEXT NOT NULL,
    "stage" "StageEnum" NOT NULL,
    "category" "CheckInCategoryEnum" NOT NULL,
    "questionId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_in_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_in_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "onboardingResponseId" TEXT NOT NULL,
    "stage" "StageEnum" NOT NULL,
    "scoreType" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "trafficLight" "TrafficLightEnum" NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_in_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_in_reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "onboardingResponseId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_in_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "check_in_questions_stage_category_order_key" ON "check_in_questions"("stage", "category", "order");

-- CreateIndex
CREATE UNIQUE INDEX "check_in_responses_userId_weekNumber_year_category_question_key" ON "check_in_responses"("userId", "weekNumber", "year", "category", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "check_in_scores_userId_weekNumber_year_scoreType_key" ON "check_in_scores"("userId", "weekNumber", "year", "scoreType");

-- CreateIndex
CREATE UNIQUE INDEX "check_in_reminders_userId_weekNumber_year_key" ON "check_in_reminders"("userId", "weekNumber", "year");

-- AddForeignKey
ALTER TABLE "check_in_responses" ADD CONSTRAINT "check_in_responses_onboardingResponseId_fkey" FOREIGN KEY ("onboardingResponseId") REFERENCES "onboarding_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_scores" ADD CONSTRAINT "check_in_scores_onboardingResponseId_fkey" FOREIGN KEY ("onboardingResponseId") REFERENCES "onboarding_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_reminders" ADD CONSTRAINT "check_in_reminders_onboardingResponseId_fkey" FOREIGN KEY ("onboardingResponseId") REFERENCES "onboarding_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StageEnum" AS ENUM ('PRE_LICENSE', 'LICENSE', 'POST_LICENSE');

-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('MOTHER', 'FATHER', 'OTHER');

-- CreateEnum
CREATE TYPE "FamilyTypeEnum" AS ENUM ('PADRE_MADRE', 'MADRE_MADRE', 'PADRE_PADRE', 'MADRE', 'PADRE', 'OTHER');

-- CreateEnum
CREATE TYPE "TrimesterEnum" AS ENUM ('TRIMESTER_1', 'TRIMESTER_2', 'TRIMESTER_3');

-- CreateEnum
CREATE TYPE "LicenseDurationEnum" AS ENUM ('LESS_THAN_1_MONTH', 'ONE_TO_3_MONTHS', 'THREE_TO_6_MONTHS', 'MORE_THAN_6_MONTHS', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkModalityEnum" AS ENUM ('FULL_TIME_PRESENTIAL', 'FULL_TIME_HYBRID', 'FULL_TIME_REMOTE', 'PART_TIME_PRESENTIAL', 'PART_TIME_HYBRID', 'PART_TIME_REMOTE', 'OTHER');

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "enable" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_responses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" "RoleEnum",
    "familyType" "FamilyTypeEnum",
    "familyTypeOther" TEXT,
    "currentStage" "StageEnum",
    "trimester" "TrimesterEnum",
    "estimatedDueDate" TIMESTAMP(3),
    "babyBirthDate" TIMESTAMP(3),
    "licenseDuration" "LicenseDurationEnum",
    "licenseDurationOther" TEXT,
    "workModality" "WorkModalityEnum",
    "workModalityOther" TEXT,
    "learningTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preLicenseSupportNeeds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "licenseSupportNeeds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "postLicenseSupportNeeds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_responses_userId_key" ON "onboarding_responses"("userId");

-- AddForeignKey
ALTER TABLE "onboarding_responses" ADD CONSTRAINT "onboarding_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

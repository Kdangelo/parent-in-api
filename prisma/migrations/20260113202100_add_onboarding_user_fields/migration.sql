-- AlterTable
ALTER TABLE "onboarding_responses" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "currentEmploymentStatus" TEXT,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "jobRole" TEXT,
ADD COLUMN     "numberOfChildren" TEXT,
ADD COLUMN     "organizationType" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "userDescription" TEXT,
ADD COLUMN     "userType" TEXT;

import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingNotCompletedGuard } from './guards/onboarding-not-completed.guard';
import { OnboardingCompletedGuard } from './guards/onboarding-completed.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingNotCompletedGuard, OnboardingCompletedGuard],
  exports: [OnboardingService],
})
export class OnboardingModule {}


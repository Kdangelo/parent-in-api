import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { CheckInController } from './controllers/check-in.controller';
import { OnboardingService } from './onboarding.service';
import { CheckInService } from './services/check-in.service';
import { OnboardingNotCompletedGuard } from './guards/onboarding-not-completed.guard';
import { OnboardingCompletedGuard } from './guards/onboarding-completed.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OnboardingController, CheckInController],
  providers: [OnboardingService, CheckInService, OnboardingNotCompletedGuard, OnboardingCompletedGuard],
  exports: [OnboardingService, CheckInService],
})
export class OnboardingModule {}


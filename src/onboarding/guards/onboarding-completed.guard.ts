import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OnboardingCompletedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.isOnboardingCompleted) {
      throw new ForbiddenException(
        'Debes completar el onboarding primero.',
      );
    }

    return true;
  }
}


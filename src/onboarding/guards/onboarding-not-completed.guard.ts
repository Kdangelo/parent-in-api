import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OnboardingNotCompletedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.isOnboardingCompleted) {
      throw new ForbiddenException(
        'Ya completaste el onboarding. Usa /onboarding/me para editar.',
      );
    }

    return true;
  }
}


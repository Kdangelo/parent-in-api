import { IsEnum } from 'class-validator';
import { StageEnum } from '../enums/stage.enum';

/**
 * POST /onboarding/transition — Cambiar de etapa (después de completar)
 */
export class StageTransitionDto {
  @IsEnum(StageEnum, { message: 'currentStage inválido' })
  currentStage: StageEnum;
}


import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StageEnum } from '../enums/stage.enum';

/**
 * POST /onboarding/transition — Cambiar de etapa (después de completar)
 */
export class StageTransitionDto {
  @ApiProperty({
    description: 'Nueva etapa a la que se desea transicionar',
    enum: StageEnum,
    example: StageEnum.LICENSE,
  })
  @IsEnum(StageEnum, { message: 'currentStage inválido' })
  currentStage: StageEnum;
}


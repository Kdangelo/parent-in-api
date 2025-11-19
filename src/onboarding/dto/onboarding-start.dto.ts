import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RoleEnum } from '../enums/role.enum';
import { FamilyTypeEnum } from '../enums/family-type.enum';
import { StageEnum } from '../enums/stage.enum';

/**
 * Paso 1: Crear onboarding (identidad básica)
 */
export class OnboardingStartDto {
  @IsEnum(RoleEnum, { message: 'userRole inválido' })
  userRole: RoleEnum;

  @IsEnum(FamilyTypeEnum, { message: 'familyType inválido' })
  familyType: FamilyTypeEnum;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  familyTypeOther?: string;

  @IsEnum(StageEnum, { message: 'currentStage inválido' })
  currentStage: StageEnum;
}


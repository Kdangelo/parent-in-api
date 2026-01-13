import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum } from '../enums/role.enum';
import { FamilyTypeEnum } from '../enums/family-type.enum';
import { StageEnum } from '../enums/stage.enum';

/**
 * Paso 1: Crear onboarding (identidad básica)
 */
export class OnboardingStartDto {
  @ApiProperty({
    description: 'Rol del usuario en la familia',
    enum: RoleEnum,
    example: RoleEnum.MOTHER,
  })
  @IsEnum(RoleEnum, { message: 'userRole inválido' })
  userRole: RoleEnum;

  @ApiProperty({
    description: 'Tipo de familia',
    enum: FamilyTypeEnum,
    example: FamilyTypeEnum.PADRE_MADRE,
  })
  @IsEnum(FamilyTypeEnum, { message: 'familyType inválido' })
  familyType: FamilyTypeEnum;

  @ApiPropertyOptional({
    description: 'Descripción del tipo de familia cuando se selecciona OTHER',
    example: 'Familia extendida',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  familyTypeOther?: string;

  @ApiProperty({
    description: 'Etapa actual en el proceso de licencia',
    enum: StageEnum,
    example: StageEnum.PRE_LICENSE,
  })
  @IsEnum(StageEnum, { message: 'currentStage inválido' })
  currentStage: StageEnum;
}


import { IsEnum, IsOptional, IsDateString, IsString, MaxLength, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TrimesterEnum } from '../enums/trimester.enum';
import { LicenseDurationEnum } from '../enums/license-duration.enum';
import { WorkModalityEnum } from '../enums/work-modality.enum';

/**
 * Paso 2 + 3: Completar datos según etapa y finalizar onboarding con temas de aprendizaje
 */
export class StageDetailsDto {
  // PRE_LICENSE
  @ApiPropertyOptional({
    description: 'Trimestre de embarazo (solo para PRE_LICENSE)',
    enum: TrimesterEnum,
    example: TrimesterEnum.TRIMESTER_1,
  })
  @IsOptional()
  @IsEnum(TrimesterEnum)
  trimester?: TrimesterEnum;

  @ApiPropertyOptional({
    description: 'Fecha estimada de parto (solo para PRE_LICENSE)',
    example: '2024-06-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  estimatedDueDate?: string;

  // LICENSE
  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del bebé (solo para LICENSE)',
    example: '2024-05-10',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  babyBirthDate?: string;

  @ApiPropertyOptional({
    description: 'Duración de la licencia (solo para LICENSE)',
    enum: LicenseDurationEnum,
    example: LicenseDurationEnum.THREE_TO_6_MONTHS,
  })
  @IsOptional()
  @IsEnum(LicenseDurationEnum)
  licenseDuration?: LicenseDurationEnum;

  @ApiPropertyOptional({
    description: 'Descripción de la duración de licencia cuando se selecciona OTHER (solo para LICENSE)',
    example: 'Licencia extendida de 8 meses',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  licenseDurationOther?: string;

  // POST_LICENSE
  @ApiPropertyOptional({
    description: 'Modalidad de trabajo (solo para POST_LICENSE)',
    enum: WorkModalityEnum,
    example: WorkModalityEnum.FULL_TIME_REMOTE,
  })
  @IsOptional()
  @IsEnum(WorkModalityEnum)
  workModality?: WorkModalityEnum;

  @ApiPropertyOptional({
    description: 'Fecha de regreso al trabajo (solo para POST_LICENSE)',
    example: '2024-09-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la modalidad de trabajo cuando se selecciona OTHER (solo para POST_LICENSE)',
    example: 'Trabajo por proyectos',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  workModalityOther?: string;

  // Support needs (arrays de strings)
  @ApiPropertyOptional({
    description: 'Necesidades de apoyo durante PRE_LICENSE',
    type: [String],
    example: ['Apoyo emocional', 'Información sobre lactancia'],
  })
  @IsOptional()
  @IsArray()
  preLicenseSupportNeeds?: string[];

  @ApiPropertyOptional({
    description: 'Necesidades de apoyo durante LICENSE',
    type: [String],
    example: ['Apoyo en cuidado del bebé', 'Red de apoyo familiar'],
  })
  @IsOptional()
  @IsArray()
  licenseSupportNeeds?: string[];

  @ApiPropertyOptional({
    description: 'Necesidades de apoyo durante POST_LICENSE',
    type: [String],
    example: ['Conciliación trabajo-familia', 'Apoyo en guardería'],
  })
  @IsOptional()
  @IsArray()
  postLicenseSupportNeeds?: string[];
}


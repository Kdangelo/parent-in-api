import { IsEnum, IsOptional, IsDateString, IsString, MaxLength, IsArray } from 'class-validator';
import { TrimesterEnum } from '../enums/trimester.enum';
import { LicenseDurationEnum } from '../enums/license-duration.enum';
import { WorkModalityEnum } from '../enums/work-modality.enum';

/**
 * Paso 2: Completar datos según etapa
 */
export class StageDetailsDto {
  // PRE_LICENSE
  @IsOptional()
  @IsEnum(TrimesterEnum)
  trimester?: TrimesterEnum;

  @IsOptional()
  @IsDateString()
  estimatedDueDate?: string;

  // LICENSE
  @IsOptional()
  @IsDateString()
  babyBirthDate?: string;

  @IsOptional()
  @IsEnum(LicenseDurationEnum)
  licenseDuration?: LicenseDurationEnum;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  licenseDurationOther?: string;

  // POST_LICENSE
  @IsOptional()
  @IsEnum(WorkModalityEnum)
  workModality?: WorkModalityEnum;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  workModalityOther?: string;

  // Support needs (arrays de strings)
  @IsOptional()
  @IsArray()
  preLicenseSupportNeeds?: string[];

  @IsOptional()
  @IsArray()
  licenseSupportNeeds?: string[];

  @IsOptional()
  @IsArray()
  postLicenseSupportNeeds?: string[];
}


import { IsEnum, IsOptional, IsString, IsArray, MaxLength } from 'class-validator';
import { RoleEnum } from '../enums/role.enum';
import { FamilyTypeEnum } from '../enums/family-type.enum';

/**
 * PATCH /onboarding/me — Editar datos generales (después de completar)
 */
export class UpdateOnboardingDto {
  @IsOptional()
  @IsEnum(RoleEnum)
  userRole?: RoleEnum;

  @IsOptional()
  @IsEnum(FamilyTypeEnum)
  familyType?: FamilyTypeEnum;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  familyTypeOther?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningTopics?: string[];
}


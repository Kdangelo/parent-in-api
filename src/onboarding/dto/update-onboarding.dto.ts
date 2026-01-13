import { IsEnum, IsOptional, IsString, IsArray, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum } from '../enums/role.enum';
import { FamilyTypeEnum } from '../enums/family-type.enum';

/**
 * PATCH /onboarding/me — Editar datos generales (después de completar)
 */
export class UpdateOnboardingDto {
  @ApiPropertyOptional({
    description: 'Rol del usuario en la familia',
    enum: RoleEnum,
    example: RoleEnum.FATHER,
  })
  @IsOptional()
  @IsEnum(RoleEnum)
  userRole?: RoleEnum;

  @ApiPropertyOptional({
    description: 'Tipo de familia',
    enum: FamilyTypeEnum,
    example: FamilyTypeEnum.MADRE_MADRE,
  })
  @IsOptional()
  @IsEnum(FamilyTypeEnum)
  familyType?: FamilyTypeEnum;

  @ApiPropertyOptional({
    description: 'Descripción del tipo de familia cuando se selecciona OTHER',
    example: 'Familia monoparental con apoyo extendido',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  familyTypeOther?: string;

  @ApiPropertyOptional({
    description: 'Lista actualizada de temas de aprendizaje de interés',
    type: [String],
    example: ['Nutrición infantil', 'Desarrollo motor', 'Sueño del bebé'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningTopics?: string[];
}


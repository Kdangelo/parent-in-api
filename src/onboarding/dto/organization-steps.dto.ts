import { IsString, IsInt, IsArray, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { OrganizationSizeEnum } from '../enums/organization-size.enum';

const legacySizeMap: Record<string, OrganizationSizeEnum> = {
  startup: OrganizationSizeEnum.SMALL,
  pyme: OrganizationSizeEnum.MEDIUM,
  corporacion: OrganizationSizeEnum.LARGE,
  'ong/orgpublico': OrganizationSizeEnum.ENTERPRISE,
};

export class OrganizationStepsDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Acme Corp', required: false })
  organizationName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Tecnología / Software / SaaS', required: false })
  organizationIndustry?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return legacySizeMap[value] ?? value;
    }
    return value;
  })
  @IsEnum(OrganizationSizeEnum)
  @ApiProperty({ example: 'SMALL', enum: OrganizationSizeEnum, required: false })
  organizationSize?: OrganizationSizeEnum;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Gerente de Recursos Humanos', required: false })
  organizationRole?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'MAYORIA_FEMENINO',
    enum: ['MAYORIA_FEMENINO', 'MAYORIA_MASCULINO', 'EQUILIBRADA', 'NO_BINARIAS', 'otra'],
    required: false
  })
  genderDistribution?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'BETWEEN_41_AND_60',
    enum: ['LESS_THAN_20', 'BETWEEN_21_AND_40', 'BETWEEN_41_AND_60', 'MORE_THAN_60', 'otra'],
    required: false
  })
  percentageMothers?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'BETWEEN_21_AND_40',
    enum: ['LESS_THAN_20', 'BETWEEN_21_AND_40', 'BETWEEN_41_AND_60', 'MORE_THAN_60', 'otra'],
    required: false
  })
  percentageFathers?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'legal',
    enum: ['legal', 'legalExtendRemun', 'legalExtendNORemun', 'legalExtendMixta', 'masDeTresMeses', 'variabls', 'otra'],
    required: false
  })
  maternityLeaveDays?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'BETWEEN_1_AND_7_DAYS',
    enum: ['no', 'BETWEEN_1_AND_7_DAYS', 'BETWEEN_1_AND_3_WEEKS', 'BETWEEN_1_AND_2_MONTHS', 'MORE_THAN_2_MONTHS', 'variabls', 'otra'],
    required: false
  })
  paternityLeaveDays?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @ApiProperty({ example: 4, minimum: 1, maximum: 5, required: false })
  flexibilityScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @ApiProperty({ example: 3, minimum: 1, maximum: 5, required: false })
  workLifeBalanceScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  @ApiProperty({ example: 4, minimum: 1, maximum: 5, required: false })
  emotionalSupportScore?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['parentalLeave', 'flexibleWork', 'emotionalSupport'],
    required: false
  })
  currentInitiatives?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['licenseExtension', 'workshops'],
    required: false
  })
  desiredInitiatives?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'policiesAndProcesses',
    enum: ['individualShares', 'definedPolicies', 'policiesAndProcesses', 'weMeasureImpact'],
    required: false
  })
  organizationalMaturity?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['talentTurnover', 'productivity', 'burnout'],
    required: false,
    description: 'Select up to 5 options'
  })
  organizationalChallenges?: string[];
}

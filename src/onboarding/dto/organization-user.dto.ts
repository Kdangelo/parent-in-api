import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationSizeEnum } from '../enums/organization-size.enum';

export class OrganizationUserDto {
  @IsString()
  @ApiProperty({ example: 'Acme Corp' })
  organizationName: string;

  @IsEnum(OrganizationSizeEnum)
  @ApiProperty({ enum: OrganizationSizeEnum })
  organizationSize: OrganizationSizeEnum;

  @IsString()
  @ApiProperty({ example: 'Technology / Software / SaaS' })
  organizationIndustry: string;

  @IsString()
  @ApiProperty({ example: 'HR Manager' })
  organizationRole: string;
}

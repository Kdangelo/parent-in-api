import { IsString, IsUrl, IsNumber, IsArray, IsOptional, ArrayMinSize, ArrayMaxSize, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProfessionalUserDto {
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    example: 'https://linkedin.com/in/username',
    description: 'URL to LinkedIn profile or cloud CV (same field)',
    required: false,
  })
  linkedinOrCV?: string;


  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ApiProperty({
    example: ['PSYCHOLOGY', 'PARENTAL_COACHING', 'LACTATION'],
    description: 'List of specialization enums'
  })
  areasOfSpecialization: string[];

  @IsNumber()
  @Min(0)
  @Max(9999.99)
  @Type(() => Number)
  @ApiProperty({ example: 150, description: 'Estimated price per session in USD' })
  estimatedPricePerSession: number;

  @IsString()
  @MaxLength(500)
  @ApiProperty({ example: 'I am passionate about supporting mothers during their journey...' })
  motivation: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @ApiProperty({ example: 5, required: false, description: 'Years of professional experience' })
  yearsOfExperience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ example: ['Certified Lactation Consultant', 'Advanced Coaching Certification'], required: false })
  certifications?: string[];
}

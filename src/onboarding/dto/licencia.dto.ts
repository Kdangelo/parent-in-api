import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LicenciaDto {
    @IsString()
    @ApiProperty({ description: 'Birth date of the baby' })
    birthDate: string;

    @IsString()
    @ApiProperty({ description: 'Duration of the leave' })
    leaveDuration: string;

    @IsString({ each: true })
    @ApiProperty({ type: [String], description: 'Support needs array' })
    supportNeed: string[];
} 
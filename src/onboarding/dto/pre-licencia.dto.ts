import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreLicenciaDto {
    @IsString()
    @ApiProperty({ description: 'Trimester (e.g., Primer Trimestre)' })
    trimester: 'Primer Trimestre' | 'Segundo Trimestre' | 'Tercer Trimestre';

    @IsString()
    @ApiProperty({ description: 'Approximate due date' })
    dueDate: string;

    @IsString({ each: true })
    @ApiProperty({ type: [String], description: 'Support needs array' })
    supportNeed: string[];
} 
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostLicenciaDto {
    @IsString()
    @ApiProperty({ description: 'Return date to work' })
    returnDate: string;

    @IsString()
    @ApiProperty({ description: 'Return type (part-time, full, presential, etc)' })
    returnType: string;

    @IsString()
    @ApiProperty({ description: 'Duration of the leave' })
    leaveDuration: string;

    @IsString({ each: true })
    @ApiProperty({ type: [String], description: 'Support needs array' })
    supportNeed: string[];
} 
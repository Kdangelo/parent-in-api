import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDataDto {
    @IsDateString()
    @ApiProperty({ type: String, format: 'date-time' })
    birthday: string;

    @IsString()
    @ApiProperty()
    city: string;

    @IsString()
    @ApiProperty()
    country: string;

    @IsString()
    @ApiProperty()
    genre: string;

    @IsString()
    @ApiProperty()
    phone: string;

    @IsString()
    @ApiProperty({ enum: ['parental','organization','professional'] })
    userType: 'parental' | 'organization' | 'professional';
}
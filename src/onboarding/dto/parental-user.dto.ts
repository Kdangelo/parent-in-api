import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParentalUserDto {
    @IsString()
    @ApiProperty()
    currentEmploymentStatus: string;

    @IsString()
    @ApiProperty()
    currentRole: string;

    @IsString()
    @ApiProperty()
    familyType: string;

    @IsString()
    @ApiProperty()
    numberOfChildren: string;

    @IsString()
    @ApiProperty()
    organizationType: string;

    @IsString()
    @ApiProperty({ enum: ['preLicencia','licencia','postLicencia'] })
    parentalStage: 'preLicencia' | 'licencia' | 'postLicencia';

    @IsString()
    @ApiProperty()
    userDescription: string;
}
import { IsInt, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInAnswerDto {
  @IsUUID()
  @ApiProperty({ example: 'pre_work_1' })
  questionId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({ example: 4, description: 'Rating from 1 to 5' })
  rating: number;
}

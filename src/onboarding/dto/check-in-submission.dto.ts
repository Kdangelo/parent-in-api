import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CheckInAnswerDto } from './check-in-answer.dto';

export class CheckInSubmissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckInAnswerDto)
  @ApiProperty({
    type: [CheckInAnswerDto],
    example: [
      { questionId: 'pre_work_1', rating: 4 },
      { questionId: 'pre_wellbeing_1', rating: 3 },
      { questionId: 'pre_home_1', rating: 5 },
    ]
  })
  answers: CheckInAnswerDto[];
}

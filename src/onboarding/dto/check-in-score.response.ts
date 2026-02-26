import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class CheckInCategoryScore {
  @ApiProperty({ example: 'work' })
  category: 'work' | 'wellbeing' | 'home';

  @ApiProperty({ example: 4.5, description: 'Score from 1.0 to 5.0' })
  score: number;

  @ApiProperty({ enum: ['red', 'yellow', 'green'] })
  trafficLight: 'red' | 'yellow' | 'green';
}

export class CheckInScoreResponse {
  @ApiProperty({ example: 7, description: 'ISO week number' })
  weekNumber: number;

  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ type: [CheckInCategoryScore] })
  categories: CheckInCategoryScore[];

  @ApiProperty({ example: 4.2, description: 'Average score across all categories' })
  overallScore: number;

  @ApiProperty({ example: '2026-02-12T10:30:00Z' })
  submittedAt: Date;
}

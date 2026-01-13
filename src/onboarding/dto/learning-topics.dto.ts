import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Paso 3: Temas de aprendizaje y finalizar onboarding
 */
export class LearningTopicsDto {
  @ApiProperty({
    description: 'Lista de temas de aprendizaje de interés',
    type: [String],
    example: ['Nutrición infantil', 'Desarrollo cognitivo', 'Primeros auxilios'],
  })
  @IsArray()
  @IsString({ each: true })
  learningTopics: string[];
}


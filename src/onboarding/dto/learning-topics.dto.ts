import { IsArray, IsString } from 'class-validator';

/**
 * Paso 3: Temas de aprendizaje y finalizar onboarding
 */
export class LearningTopicsDto {
  @IsArray()
  @IsString({ each: true })
  learningTopics: string[];
}


import { Controller, Get, Post, Body, Request, UseGuards, HttpCode, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CheckInService } from '../services/check-in.service';
import { OnboardingCompletedGuard } from '../guards/onboarding-completed.guard';
import { CheckInSubmissionDto } from '../dto/check-in-submission.dto';

@ApiTags('check-ins')
@ApiBearerAuth('JWT-auth')
@Controller('check-ins')
@UseGuards(JwtAuthGuard)
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  /**
   * GET /check-ins/status
   * Check if user has pending check-in for current week
   */
  @Get('status')
  @UseGuards(OnboardingCompletedGuard)
  @ApiOperation({ summary: 'Obtener estado del check-in semanal' })
  @ApiResponse({ status: 200, description: 'Estado obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'Onboarding no completado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Onboarding no encontrado' })
  async getCheckInStatus(@Request() req) {
    return this.checkInService.getCheckInStatus(req.user.id);
  }

  /**
   * POST /check-ins/submit
   * Submit weekly check-in responses
   */
  @Post('submit')
  @UseGuards(OnboardingCompletedGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Enviar respuestas del check-in semanal' })
  @ApiBody({ type: CheckInSubmissionDto })
  @ApiResponse({ status: 201, description: 'Check-in registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o onboarding no completado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async submitCheckIn(@Request() req, @Body() dto: CheckInSubmissionDto) {
    return this.checkInService.submitCheckIn(req.user.id, dto);
  }

  /**
   * GET /check-ins/history
   * Return historical check-in scores with pagination
   */
  @Get('history')
  @UseGuards(OnboardingCompletedGuard)
  @ApiOperation({ summary: 'Obtener historial de check-ins' })
  @ApiQuery({ name: 'limit', example: 10, required: false })
  @ApiQuery({ name: 'offset', example: 0, required: false })
  @ApiResponse({ status: 200, description: 'Historial obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Onboarding no encontrado' })
  async getCheckInHistory(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.checkInService.getCheckInHistory(
      req.user.id,
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    );
  }

  /**
   * GET /check-ins/:week/score
   * Get score for specific week
   */
  @Get(':week/score')
  @UseGuards(OnboardingCompletedGuard)
  @ApiOperation({ summary: 'Obtener puntuación de una semana específica' })
  @ApiResponse({ status: 200, description: 'Puntuación obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Check-in no encontrado para esa semana' })
  async getCheckInScore(
    @Request() req,
    @Param('week') weekNumber: string,
    @Query('year') year?: string,
  ) {
    return this.checkInService.getCheckInScore(
      req.user.id,
      parseInt(weekNumber),
      year ? parseInt(year) : undefined,
    );
  }

  /**
   * GET /check-ins/questions/:stage
   * Get all questions for a given stage
   */
  @Get('questions/:stage')
  @UseGuards(OnboardingCompletedGuard)
  @ApiOperation({ summary: 'Obtener preguntas de check-in para una etapa' })
  @ApiResponse({ status: 200, description: 'Preguntas obtenidas exitosamente' })
  @ApiResponse({ status: 400, description: 'Etapa desconocida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getCheckInQuestions(@Param('stage') stage: string) {
    return this.checkInService.getCheckInQuestions(stage);
  }
}

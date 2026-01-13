import { Controller, Get, Post, Put, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { OnboardingNotCompletedGuard } from './guards/onboarding-not-completed.guard';
import { OnboardingCompletedGuard } from './guards/onboarding-completed.guard';
import { OnboardingStartDto } from './dto/onboarding-start.dto';
import { StageDetailsDto } from './dto/stage-details.dto';
import { LearningTopicsDto } from './dto/learning-topics.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { StageTransitionDto } from './dto/stage-transition.dto';

@ApiTags('onboarding')
@ApiBearerAuth('JWT-auth')
@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // ========================================
  // FLUJO INICIAL (Primera vez)
  // ========================================

  /**
   * GET /onboarding/status
   * Verificar si el usuario completó onboarding
   */
  @Get('status')
  @ApiOperation({ summary: 'Verificar estado del onboarding' })
  @ApiResponse({ status: 200, description: 'Estado del onboarding obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getStatus(@Request() req) {
    return this.onboardingService.getStatus(req.user.id);
  }

  /**
   * POST /onboarding/start
   * Paso 1: Identidad + Familia + Etapa
   * Solo accesible si NO completó onboarding
   */
  @Post('start')
  @UseGuards(OnboardingNotCompletedGuard)
  @ApiOperation({ summary: 'Iniciar proceso de onboarding - Paso 1: Identidad, Familia y Etapa' })
  @ApiResponse({ status: 201, description: 'Onboarding iniciado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding ya fue completado' })
  async start(@Request() req, @Body() dto: OnboardingStartDto) {
    return this.onboardingService.start(req.user.id, dto);
  }

  /**
   * PUT /onboarding/stage-details
   * Paso 2: Datos específicos según etapa (trimestre, fecha, etc) + necesidades de apoyo
   * Solo accesible si NO completó onboarding
   */
  @Put('stage-details')
  @UseGuards(OnboardingNotCompletedGuard)
  @ApiOperation({ summary: 'Actualizar detalles de la etapa - Paso 2: Datos específicos según etapa' })
  @ApiResponse({ status: 200, description: 'Detalles de la etapa actualizados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding ya fue completado' })
  @ApiResponse({ status: 404, description: 'Onboarding no encontrado' })
  async updateStageDetails(@Request() req, @Body() dto: StageDetailsDto) {
    return this.onboardingService.updateStageDetails(req.user.id, dto);
  }

  /**
   * PUT /onboarding/learning-topics
   * Paso 3: Temas de aprendizaje y FINALIZAR onboarding
   * Solo accesible si NO completó onboarding
   */
  @Put('learning-topics')
  @UseGuards(OnboardingNotCompletedGuard)
  @ApiOperation({ summary: 'Finalizar onboarding - Paso 3: Temas de aprendizaje' })
  @ApiResponse({ status: 200, description: 'Onboarding completado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding ya fue completado' })
  @ApiResponse({ status: 404, description: 'Onboarding no encontrado' })
  async finalize(@Request() req, @Body() dto: LearningTopicsDto) {
    return this.onboardingService.finalize(req.user.id, dto);
  }

  // ========================================
  // DESPUÉS DE COMPLETAR (Edición)
  // ========================================

  /**
   * GET /onboarding/data
   * Ver datos guardados del onboarding
   */
  @Get('data')
  @ApiOperation({ summary: 'Obtener datos del onboarding del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Datos del onboarding obtenidos exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMyOnboarding(@Request() req) {
    return this.onboardingService.findByUserId(req.user.id);
  }

  /**
   * GET /onboarding/me
   * Ver onboarding completo (requiere haber completado)
   */
  @Get('me')
  @UseGuards(OnboardingCompletedGuard)
  @ApiOperation({ summary: 'Obtener onboarding completo del usuario' })
  @ApiResponse({ status: 200, description: 'Onboarding completo obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding no ha sido completado' })
  async getMyOnboardingCompleted(@Request() req) {
    return this.onboardingService.findByUserId(req.user.id);
  }

  /**
   * PATCH /onboarding/me
   * Editar datos generales (requiere haber completado)
   */
  @Patch('me')
  @UseGuards(OnboardingCompletedGuard)
  @ApiOperation({ summary: 'Actualizar datos del onboarding' })
  @ApiResponse({ status: 200, description: 'Onboarding actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding no ha sido completado' })
  @ApiResponse({ status: 404, description: 'Onboarding no encontrado' })
  async updateMyOnboarding(@Request() req, @Body() dto: UpdateOnboardingDto) {
    return this.onboardingService.update(req.user.id, dto);
  }

  /**
   * POST /onboarding/transition
   * Cambiar de etapa (requiere haber completado)
   */
  @Post('transition')
  @UseGuards(OnboardingCompletedGuard)
  @ApiOperation({ summary: 'Cambiar de etapa en el onboarding' })
  @ApiResponse({ status: 200, description: 'Transición de etapa realizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o transición no permitida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding no ha sido completado' })
  @ApiResponse({ status: 404, description: 'Onboarding no encontrado' })
  async transitionStage(@Request() req, @Body() dto: StageTransitionDto) {
    return this.onboardingService.transitionStage(req.user.id, dto);
  }
}


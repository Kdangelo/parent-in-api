import { Controller, Get, Post, Put, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { OnboardingNotCompletedGuard } from './guards/onboarding-not-completed.guard';
import { OnboardingCompletedGuard } from './guards/onboarding-completed.guard';
import { OnboardingStartDto } from './dto/onboarding-start.dto';
import { StageDetailsDto } from './dto/stage-details.dto';
import { LearningTopicsDto } from './dto/learning-topics.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { StageTransitionDto } from './dto/stage-transition.dto';

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
  async getMyOnboarding(@Request() req) {
    return this.onboardingService.findByUserId(req.user.id);
  }

  /**
   * GET /onboarding/me
   * Ver onboarding completo (requiere haber completado)
   */
  @Get('me')
  @UseGuards(OnboardingCompletedGuard)
  async getMyOnboardingCompleted(@Request() req) {
    return this.onboardingService.findByUserId(req.user.id);
  }

  /**
   * PATCH /onboarding/me
   * Editar datos generales (requiere haber completado)
   */
  @Patch('me')
  @UseGuards(OnboardingCompletedGuard)
  async updateMyOnboarding(@Request() req, @Body() dto: UpdateOnboardingDto) {
    return this.onboardingService.update(req.user.id, dto);
  }

  /**
   * POST /onboarding/transition
   * Cambiar de etapa (requiere haber completado)
   */
  @Post('transition')
  @UseGuards(OnboardingCompletedGuard)
  async transitionStage(@Request() req, @Body() dto: StageTransitionDto) {
    return this.onboardingService.transitionStage(req.user.id, dto);
  }
}


import { Controller, Get, Post, Put, Patch, Body, Request, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { OnboardingNotCompletedGuard } from './guards/onboarding-not-completed.guard';
import { OnboardingCompletedGuard } from './guards/onboarding-completed.guard';
import { UserDataDto } from './dto/user-data.dto';
import { ParentalUserDto } from './dto/parental-user.dto';
import { StageDetailsDto } from './dto/stage-details.dto';
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
   * Paso 1: Datos generales del usuario (birthday, city, country, genre, phone, userType)
   * Solo accesible si NO completó onboarding
   */
  @Post('start')
  @UseGuards(OnboardingNotCompletedGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Iniciar proceso de onboarding - Paso 1: Guardar datos del usuario' })
  @ApiBody({ type: UserDataDto })
  @ApiResponse({ status: 201, description: 'Paso 1 completado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding ya fue completado' })
  async start(@Request() req, @Body() dto: UserDataDto) {
    return this.onboardingService.start(req.user.id, dto);
  }

  /**
   * POST /onboarding/parental
   * Paso 2: Datos parentales (solo para userType = parental)
   */
  @Post('parental')
  @UseGuards(OnboardingNotCompletedGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Guardar datos parentales (Paso 2)' })
  @ApiBody({ type: ParentalUserDto })
  @ApiResponse({ status: 201, description: 'Paso 2 (parenteral) guardado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario no parental' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding ya fue completado' })
  async saveParental(@Request() req, @Body() dto: ParentalUserDto) {
    return this.onboardingService.saveParentalData(req.user.id, dto);
  }

  /**
   * PUT /onboarding/stage-details
   * Paso 2 + 3: Datos específicos según etapa + temas de aprendizaje (finaliza onboarding)
   * Solo accesible si NO completó onboarding
   */
  @Put('stage-details')
  @UseGuards(OnboardingNotCompletedGuard)
  @ApiOperation({ summary: 'Completar onboarding - Paso 2+3: Datos de etapa y temas de aprendizaje' })
  @ApiResponse({ status: 200, description: 'Onboarding completado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding ya fue completado' })
  @ApiResponse({ status: 404, description: 'Onboarding no encontrado' })
  async updateStageDetails(@Request() req, @Body() dto: StageDetailsDto) {
    return this.onboardingService.updateStageDetails(req.user.id, dto);
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


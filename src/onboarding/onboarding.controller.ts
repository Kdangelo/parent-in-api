import { Controller, Get, Post, Put, Patch, Body, Request, UseGuards, HttpCode, Param } from '@nestjs/common';
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
import { OrganizationUserDto } from './dto/organization-user.dto';
import { OrganizationStepsDto } from './dto/organization-steps.dto';
import { ProfessionalUserDto } from './dto/professional-user.dto';

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

  // ========================================
  // FLUJO ORGANIZACIÓN (16 pasos)
  // ========================================

  /**
   * POST /onboarding/organization/start
   * Paso 1: Guardar datos básicos de organización
   */
  @Post('organization/start')
  @UseGuards(OnboardingNotCompletedGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Iniciar onboarding de organización - Paso 1' })
  @ApiBody({ type: OrganizationUserDto })
  @ApiResponse({ status: 201, description: 'Paso 1 (organización) completado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario no es de organización' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding ya fue completado' })
  async startOrganizationOnboarding(@Request() req, @Body() dto: OrganizationUserDto) {
    return this.onboardingService.startOrganizationOnboarding(req.user.id, dto);
  }


  
  @Put('organization/complete')
  @UseGuards(OnboardingNotCompletedGuard)
  @ApiOperation({ summary: 'Enviar todos los datos de onboarding organizacional en un solo paso' })
  @ApiBody({ type: OrganizationStepsDto })
  @ApiResponse({ status: 200, description: 'Onboarding de organización completado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario no es de organización' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding ya fue completado' })
  async completeOrganizationOnboarding(@Request() req, @Body() dto: OrganizationStepsDto) {
    return this.onboardingService.completeOrganizationOnboarding(req.user.id, dto);
  }

  /**
   * GET /onboarding/organization/progress
   * Obtener progreso del onboarding de organización
   */
  @Get('organization/progress')
  @ApiOperation({ summary: 'Obtener progreso del onboarding de organización' })
  @ApiResponse({ status: 200, description: 'Progreso obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'Usuario no es de organización' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Onboarding no encontrado' })
  async getOrganizationProgress(@Request() req) {
    return this.onboardingService.getOrganizationProgress(req.user.id);
  }

  // ========================================
  // FLUJO PROFESIONAL
  // ========================================

  /**
   * POST /onboarding/professional/complete
   * Completar perfil profesional en un paso
   */
  @Post('professional/complete')
  @UseGuards(OnboardingNotCompletedGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Completar perfil profesional' })
  @ApiBody({ type: ProfessionalUserDto })
  @ApiResponse({ status: 201, description: 'Perfil profesional completado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario no es profesional' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'El onboarding ya fue completado' })
  async completeProfessionalProfile(@Request() req, @Body() dto: ProfessionalUserDto) {
    return this.onboardingService.completeProfessionalProfile(req.user.id, dto);
  }

  /**
   * GET /onboarding/professional
   * Obtener perfil profesional
   */
  @Get('professional')
  @UseGuards(OnboardingCompletedGuard)
  @ApiOperation({ summary: 'Obtener perfil profesional' })
  @ApiResponse({ status: 200, description: 'Perfil profesional obtenido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async getProfessionalProfile(@Request() req) {
    return this.onboardingService.getProfessionalProfile(req.user.id);
  }

  /**
   * PATCH /onboarding/professional
   * Actualizar perfil profesional
   */
  @Patch('professional')
  @UseGuards(OnboardingCompletedGuard)
  @ApiOperation({ summary: 'Actualizar perfil profesional' })
  @ApiBody({ type: ProfessionalUserDto })
  @ApiResponse({ status: 200, description: 'Perfil profesional actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario no es profesional' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  async updateProfessionalProfile(@Request() req, @Body() dto: Partial<ProfessionalUserDto>) {
    return this.onboardingService.updateProfessionalProfile(req.user.id, dto);
  }
}


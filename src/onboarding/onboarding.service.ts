import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StageDetailsDto } from './dto/stage-details.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { StageTransitionDto } from './dto/stage-transition.dto';
import { UserDataDto } from './dto/user-data.dto';
import { ParentalUserDto } from './dto/parental-user.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /onboarding/status
   * Devuelve estado del onboarding
   */
  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isOnboardingCompleted: true },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    return {
      isOnboardingCompleted: user.isOnboardingCompleted,
      message: user.isOnboardingCompleted
        ? 'Onboarding completado'
        : 'Onboarding pendiente',
    };
  }

  /**
   * POST /onboarding/start
   * Paso 1: Guardar datos generales del usuario
   */
  async start(userId: string, dto: UserDataDto) {
    const onboarding = await this.prisma.onboardingResponses.upsert({
      where: { userId },
      create: {
        userId,
        birthday: new Date(dto.birthday),
        city: dto.city,
        country: dto.country,
        genre: dto.genre,
        phone: dto.phone,
        userType: dto.userType,
      },
      update: {
        birthday: new Date(dto.birthday),
        city: dto.city,
        country: dto.country,
        genre: dto.genre,
        phone: dto.phone,
        userType: dto.userType,
      },
    });

    return {
      message: 'Paso 1 completado',
      data: onboarding,
    };
  }

  /**
   * POST /onboarding/parental
   * Paso 2 para usuarios parentales: datos parentales
   */
  async saveParentalData(userId: string, dto: ParentalUserDto) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({ where: { userId } });

    if (!onboarding) throw new BadRequestException('Debes completar Paso 1 primero');

    if (onboarding.userType !== 'parental') {
      throw new BadRequestException('Solo usuarios parentales pueden enviar datos parentales');
    }

    const stageMap = {
      preLicencia: 'PRE_LICENSE',
      licencia: 'LICENSE',
      postLicencia: 'POST_LICENSE',
    } as const;

    const stage = (stageMap as any)[dto.parentalStage];

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: {
        currentEmploymentStatus: dto.currentEmploymentStatus,
        jobRole: dto.currentRole,
        familyType: dto.familyType as any,
        numberOfChildren: dto.numberOfChildren,
        organizationType: dto.organizationType,
        currentStage: stage,
        userDescription: dto.userDescription,
      },
    });

    return {
      message: 'Paso 2 (parenteral) guardado',
      data: updated,
    };
  }

  /**
   * PUT /onboarding/stage-details
   * Paso 2 + 3: Guardar datos específicos según etapa + temas de aprendizaje
   * FINALIZA el onboarding
   */
  async updateStageDetails(userId: string, dto: StageDetailsDto) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      throw new BadRequestException('Debes completar Paso 1 primero');
    }

    if (onboarding.userType !== 'parental') {
      throw new BadRequestException('Paso 2 (detalles de etapa) solo aplica para usuarios parentales');
    }

    // Verificar que los campos enviados correspondan a la etapa actual
    const stage = onboarding.currentStage as string;

    if ((dto.trimester || dto.estimatedDueDate) && stage !== 'PRE_LICENSE') {
      throw new BadRequestException('Los datos de pre-licencia no corresponden a la etapa actual');
    }

    if ((dto.babyBirthDate || dto.licenseDuration || dto.licenseDurationOther) && stage !== 'LICENSE') {
      throw new BadRequestException('Los datos de licencia no corresponden a la etapa actual');
    }

    if ((dto.returnDate || dto.workModality || dto.workModalityOther) && stage !== 'POST_LICENSE') {
      throw new BadRequestException('Los datos de post-licencia no corresponden a la etapa actual');
    }

    // Actualizar datos específicos por etapa + learning topics
    const updateData: any = {};

    if (dto.trimester) updateData.trimester = dto.trimester;
    if (dto.estimatedDueDate) updateData.estimatedDueDate = new Date(dto.estimatedDueDate);
    if (dto.babyBirthDate) updateData.babyBirthDate = new Date(dto.babyBirthDate);
    if (dto.returnDate) updateData.returnDate = new Date(dto.returnDate);
    if (dto.licenseDuration) updateData.licenseDuration = dto.licenseDuration;
    if (dto.licenseDurationOther) updateData.licenseDurationOther = dto.licenseDurationOther;
    if (dto.workModality) updateData.workModality = dto.workModality;
    if (dto.workModalityOther) updateData.workModalityOther = dto.workModalityOther;
    if (dto.preLicenseSupportNeeds) updateData.preLicenseSupportNeeds = dto.preLicenseSupportNeeds;
    if (dto.licenseSupportNeeds) updateData.licenseSupportNeeds = dto.licenseSupportNeeds;
    if (dto.postLicenseSupportNeeds) updateData.postLicenseSupportNeeds = dto.postLicenseSupportNeeds;

    // Marcar onboarding como completado
    updateData.is_onboarding_completed = true;
    updateData.completedAt = new Date();

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: updateData,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboardingCompleted: true },
    });

    return {
      message: 'Detalles de la etapa actualizados',
      data: updated,
    };
  }
  /**
   * GET /onboarding/data
   * Obtener datos guardados del onboarding
   */
  async findByUserId(userId: string) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding no encontrado');
    }

    return onboarding;
  }

  /**
   * PATCH /onboarding/me
   * Editar datos generales (después de completar onboarding)
   */
  async update(userId: string, dto: UpdateOnboardingDto) {
    const updateData: any = {};

    if (dto.userRole) updateData.userRole = dto.userRole;
    if (dto.familyType) updateData.familyType = dto.familyType;
    if (dto.familyTypeOther !== undefined) updateData.familyTypeOther = dto.familyTypeOther;
    if (dto.learningTopics) updateData.learningTopics = dto.learningTopics;

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: updateData,
    });

    return {
      message: 'Datos actualizados',
      data: updated,
    };
  }

  /**
   * POST /onboarding/transition
   * Cambiar de etapa (después de completar onboarding)
   */
  async transitionStage(userId: string, dto: StageTransitionDto) {
    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: {
        currentStage: dto.currentStage,
        updatedAt: new Date(),
      },
    });

    return {
      message: `Etapa cambiada a ${dto.currentStage}`,
      data: updated,
    };
  }
}


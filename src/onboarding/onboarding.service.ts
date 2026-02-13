import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StageDetailsDto } from './dto/stage-details.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { StageTransitionDto } from './dto/stage-transition.dto';
import { UserDataDto } from './dto/user-data.dto';
import { ParentalUserDto } from './dto/parental-user.dto';
import { OrganizationUserDto } from './dto/organization-user.dto';
import { OrganizationStepsDto } from './dto/organization-steps.dto';
import { ProfessionalUserDto } from './dto/professional-user.dto';

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

  /**
   * POST /onboarding/organization/start
   * Paso 1: Guardar datos básicos de la organización
   */
  async startOrganizationOnboarding(userId: string, dto: OrganizationUserDto) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({ where: { userId } });

    if (!onboarding) throw new BadRequestException('Debes completar Paso 1 (datos generales) primero');
    if (onboarding.userType !== 'organization') {
      throw new BadRequestException('Solo usuarios de organizaciones pueden enviar datos organizacionales');
    }

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: {
        organizationName: dto.organizationName,
        organizationSize: dto.organizationSize,
        organizationIndustry: dto.organizationIndustry,
        organizationRole: dto.organizationRole,
      },
    });

    return {
      message: 'Paso 1 (organización) completado',
      data: updated,
    };
  }

  /**
   * POST /onboarding/organization/step/:step
   * Guardar datos de pasos intermedios de la organización (2-15)
   */
  async saveOrganizationStep(userId: string, stepNumber: number, dto: OrganizationStepsDto) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({ where: { userId } });

    if (!onboarding) throw new BadRequestException('Debes completar Paso 1 primero');
    if (onboarding.userType !== 'organization') {
      throw new BadRequestException('Solo usuarios de organizaciones pueden enviar datos organizacionales');
    }

    if (stepNumber < 2 || stepNumber > 15) {
      throw new BadRequestException('Paso debe estar entre 2 y 15');
    }

    const updateData: any = {};

    // Map each step to its corresponding fields
    if (stepNumber === 2) {
      if (dto.organizationIndustry) updateData.organizationIndustry = dto.organizationIndustry;
    } else if (stepNumber === 3) {
      if (dto.organizationSize) updateData.organizationSize = dto.organizationSize;
    } else if (stepNumber === 4) {
      if (dto.organizationRole) updateData.organizationRole = dto.organizationRole;
    } else if (stepNumber === 5) {
      if (dto.genderDistribution) updateData.genderDistribution = dto.genderDistribution;
    } else if (stepNumber === 6) {
      if (dto.percentageMothers) updateData.percentageMothers = dto.percentageMothers;
    } else if (stepNumber === 7) {
      if (dto.percentageFathers) updateData.percentageFathers = dto.percentageFathers;
    } else if (stepNumber === 8) {
      if (dto.maternityLeaveDays) updateData.maternityLeaveDays = dto.maternityLeaveDays;
    } else if (stepNumber === 9) {
      if (dto.paternityLeaveDays) updateData.paternityLeaveDays = dto.paternityLeaveDays;
    } else if (stepNumber === 10) {
      if (dto.flexibilityScore) updateData.flexibilityScore = dto.flexibilityScore;
    } else if (stepNumber === 11) {
      if (dto.workLifeBalanceScore) updateData.workLifeBalanceScore = dto.workLifeBalanceScore;
    } else if (stepNumber === 12) {
      if (dto.emotionalSupportScore) updateData.emotionalSupportScore = dto.emotionalSupportScore;
    } else if (stepNumber === 13) {
      if (dto.currentInitiatives) updateData.currentInitiatives = dto.currentInitiatives;
    } else if (stepNumber === 14) {
      if (dto.desiredInitiatives) updateData.desiredInitiatives = dto.desiredInitiatives;
    } else if (stepNumber === 15) {
      if (dto.organizationalMaturity) updateData.organizationalMaturity = dto.organizationalMaturity;
    }

    updateData.updatedAt = new Date();

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: updateData,
    });

    return {
      message: `Paso ${stepNumber} guardado`,
      data: updated,
    };
  }

  /**
   * PUT /onboarding/organization/complete
   * Paso 16: Guardar desafíos y completar onboarding de organización
   */
  async completeOrganizationOnboarding(userId: string, dto: OrganizationStepsDto) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({ where: { userId } });

    if (!onboarding) throw new BadRequestException('Debes completar Paso 1 primero');
    if (onboarding.userType !== 'organization') {
      throw new BadRequestException('Solo usuarios de organizaciones pueden completar este paso');
    }

    const updateData: any = {
      organizationalChallenges: dto.organizationalChallenges || [],
      is_onboarding_completed: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: updateData,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboardingCompleted: true },
    });

    return {
      message: 'Onboarding de organización completado',
      data: updated,
    };
  }

  /**
   * GET /onboarding/organization/progress
   * Obtener el progreso actual del onboarding de la organización
   */
  async getOrganizationProgress(userId: string) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({ where: { userId } });

    if (!onboarding) throw new NotFoundException('Onboarding no encontrado');
    if (onboarding.userType !== 'organization') {
      throw new BadRequestException('Usuario no es de organización');
    }

    const completedSteps = [
      1, // start
      onboarding.organizationIndustry ? 2 : null,
      onboarding.organizationSize ? 3 : null,
      onboarding.organizationRole ? 4 : null,
      onboarding.genderDistribution ? 5 : null,
      onboarding.percentageMothers ? 6 : null,
      onboarding.percentageFathers ? 7 : null,
      onboarding.maternityLeaveDays ? 8 : null,
      onboarding.paternityLeaveDays ? 9 : null,
      onboarding.flexibilityScore ? 10 : null,
      onboarding.workLifeBalanceScore ? 11 : null,
      onboarding.emotionalSupportScore ? 12 : null,
      onboarding.currentInitiatives?.length ? 13 : null,
      onboarding.desiredInitiatives?.length ? 14 : null,
      onboarding.organizationalMaturity ? 15 : null,
      onboarding.organizationalChallenges?.length ? 16 : null,
    ].filter(Boolean).length;

    return {
      totalSteps: 16,
      completedSteps,
      percentageComplete: Math.round((completedSteps / 16) * 100),
      isCompleted: onboarding.is_onboarding_completed,
    };
  }

  /**
   * POST /onboarding/professional/complete
   * Completar perfil profesional en un solo paso
   */
  async completeProfessionalProfile(userId: string, dto: ProfessionalUserDto) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({ where: { userId } });

    if (!onboarding) throw new BadRequestException('Debes completar Paso 1 primero');
    if (onboarding.userType !== 'professional') {
      throw new BadRequestException('Solo usuarios profesionales pueden enviar este perfil');
    }

    const updateData: any = {
      linkedinUrl: dto.linkedinUrl,
      cvUrl: dto.cvUrl,
      areasOfSpecialization: dto.areasOfSpecialization,
      estimatedPricePerSession: dto.estimatedPricePerSession,
      motivation: dto.motivation,
      is_onboarding_completed: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    if (dto.yearsOfExperience !== undefined) {
      updateData.numberOfChildren = dto.yearsOfExperience; // Reusing field for experience
    }

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: updateData,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboardingCompleted: true },
    });

    return {
      message: 'Perfil profesional completado',
      data: updated,
    };
  }

  /**
   * GET /onboarding/professional
   * Obtener perfil profesional
   */
  async getProfessionalProfile(userId: string) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({ where: { userId } });

    if (!onboarding) throw new NotFoundException('Perfil no encontrado');
    if (onboarding.userType !== 'professional') {
      throw new BadRequestException('Usuario no es profesional');
    }

    return {
      linkedinUrl: onboarding.linkedinUrl,
      cvUrl: onboarding.cvUrl,
      areasOfSpecialization: onboarding.areasOfSpecialization,
      estimatedPricePerSession: onboarding.estimatedPricePerSession,
      motivation: onboarding.motivation,
    };
  }

  /**
   * PATCH /onboarding/professional
   * Actualizar perfil profesional
   */
  async updateProfessionalProfile(userId: string, dto: Partial<ProfessionalUserDto>) {
    const onboarding = await this.prisma.onboardingResponses.findUnique({ where: { userId } });

    if (!onboarding) throw new NotFoundException('Perfil no encontrado');
    if (onboarding.userType !== 'professional') {
      throw new BadRequestException('Usuario no es profesional');
    }

    const updateData: any = {};

    if (dto.linkedinUrl !== undefined) updateData.linkedinUrl = dto.linkedinUrl;
    if (dto.cvUrl !== undefined) updateData.cvUrl = dto.cvUrl;
    if (dto.areasOfSpecialization) updateData.areasOfSpecialization = dto.areasOfSpecialization;
    if (dto.estimatedPricePerSession !== undefined) updateData.estimatedPricePerSession = dto.estimatedPricePerSession;
    if (dto.motivation !== undefined) updateData.motivation = dto.motivation;

    updateData.updatedAt = new Date();

    const updated = await this.prisma.onboardingResponses.update({
      where: { userId },
      data: updateData,
    });

    return {
      message: 'Perfil profesional actualizado',
      data: updated,
    };
  }
}

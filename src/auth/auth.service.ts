import { Injectable, Logger, UnauthorizedException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // Registro de usuario y envío de código de verificación
  async register(createUserDto: CreateUserDto) {
    // Crear usuario con isEmailVerified por defecto en false
    const user = await this.usersService.create(createUserDto);

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar token
    await this.prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        code,
        expiresAt,
      },
    });

    // Enviar email con código
    try {
      await this.emailService.sendVerificationCode(user.email, code);
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
    }

    return { message: 'User registered. Verification code sent to email.' };
  }

  async verifyEmail(verifyDto: VerifyEmailDto) {
    const { email, code } = verifyDto;
    const token = await this.prisma.emailVerificationToken.findFirst({ where: { email, code } });

    if (!token) {
      throw new BadRequestException('Código de verificación inválido');
    }

    if (token.expiresAt < new Date()) {
      throw new BadRequestException('El código ha expirado');
    }

    // Marcar usuario como verificado
    await this.prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
    });

    // Eliminar token
    await this.prisma.emailVerificationToken.delete({ where: { id: token.id } });

    return { message: 'Email verificado correctamente' };
  }

  async resendVerification(resendDto: ResendVerificationDto) {
    const { email } = resendDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }

    // eliminar tokens anteriores
    await this.prisma.emailVerificationToken.deleteMany({ where: { email } });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({ data: { email, code, expiresAt } });

    try {
      await this.emailService.sendVerificationCode(email, code);
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
    }

    return { message: 'Verification code resent' };
  }

  async login(loginDto: LoginDto) {
    this.logger.debug('login called');

    // Buscar usuario por email
    let user;
    try {
      user = await this.usersService.findByEmail(loginDto.email);
    } catch (err) {
      // no revelar si el email existe
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generar el JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        enable: user.enable,
        isOnboardingCompleted: user.isOnboardingCompleted,
      },
    };
  }

  async getProfile(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        enable: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

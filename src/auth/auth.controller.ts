import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 403, description: 'Email no verificado' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente. Se envió un código de verificación al email.' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email con código de verificación' })
  @ApiResponse({ status: 200, description: 'Email verificado exitosamente' })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyDto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar código de verificación al email' })
  @ApiResponse({ status: 200, description: 'Código de verificación reenviado' })
  @ApiResponse({ status: 400, description: 'El email ya está verificado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    return this.authService.resendVerification(resendDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.email);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Iniciar autenticación con Google', description: 'Redirige a Google para autenticación OAuth' })
  @ApiResponse({ status: 302, description: 'Redirección a Google OAuth' })
  async googleAuth() {
    // Redirige a Google para autenticación Ver en navegador
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback de autenticación con Google' })
  @ApiResponse({ status: 200, description: 'Autenticación con Google exitosa' })
  async googleAuthCallback(@Request() req) {
    return this.authService.googleLogin(req.user);
  }
}

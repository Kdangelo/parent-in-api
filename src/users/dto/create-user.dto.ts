import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario. Debe contener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales',
    example: 'MiContraseña123!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]/,
  { message: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales' })
  password: string;

  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío si se proporciona' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Indica si el usuario está habilitado',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo enable debe ser un valor booleano' })
  enable?: boolean;
}
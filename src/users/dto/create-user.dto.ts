import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]/,
  { message: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales' })
  password: string;
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío si se proporciona' })
  name?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo enable debe ser un valor booleano' })
  enable?: boolean;
}
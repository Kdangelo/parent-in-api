import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, IsNotEmpty, Matches, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El formato del email no es válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsOptional()
  @ValidateIf((o) => o.password !== undefined) 
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]/,
  { message: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales' })
  password?: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  name: string;

  @IsOptional() 
  @IsString({ message: 'El apellido debe ser un texto' })
  lastName?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo enable debe ser un valor booleano' })
  enable?: boolean;
}
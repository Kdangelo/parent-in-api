import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { Match } from '../../common/validators/match.decorator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  newPassword: string;

  @IsNotEmpty({ message: 'La confirmación de la nueva contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La confirmación debe tener al menos 8 caracteres' })
  @Match('newPassword', { message: 'La confirmación debe coincidir con la nueva contraseña' })
  confirmNewPassword: string;
}
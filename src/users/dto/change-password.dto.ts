import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../common/validators/match.decorator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'ContraseñaActual123!',
  })
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña. Debe contener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales',
    example: 'NuevaContraseña456!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña. Debe coincidir con newPassword',
    example: 'NuevaContraseña456!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'La confirmación de la nueva contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La confirmación debe tener al menos 8 caracteres' })
  @Match('newPassword', { message: 'La confirmación debe coincidir con la nueva contraseña' })
  confirmNewPassword: string;
}
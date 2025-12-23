import { Injectable, Logger, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = createUserDto.password 
        ? await bcrypt.hash(createUserDto.password, 10)
        : undefined;
      return await this.prisma.user.create({
        data: { 
          ...createUserDto,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          name: true,
          lastName: true,
          enable: true,
          password: false,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      this.logger.error('Error creating user', error.stack);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          lastName: true,
          enable: true,
          password: false,
        },
      });
    } catch (error) {
      this.logger.error('Error fetching users', error.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          lastName: true,
          enable: true,
          isOnboardingCompleted: true,
          password: false,
        },
      });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching user ${id}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          lastName: true,
          enable: true,
          password: false,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
      }
      this.logger.error(`Error updating user ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
      }
      this.logger.error(`Error deleting user ${id}`, error.stack);
      throw error;
    }
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    try {
      // Obtener el usuario con su contraseña actual
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (!user.password) {
        throw new BadRequestException('Cannot change password for Google OAuth users');
      }

      // Verificar que la contraseña actual es correcta
      const isPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Verificar que la nueva contraseña es diferente de la actual
      const isSamePassword = await bcrypt.compare(
        changePasswordDto.newPassword,
        user.password,
      );

      if (isSamePassword) {
        throw new ConflictException('New password must be different from current password');
      }

      // Encriptar y actualizar la nueva contraseña
      const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
      await this.prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
        },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof UnauthorizedException || 
          error instanceof ConflictException ||
          error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error changing password for user ${id}`, error.stack);
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching user by email ${email}`, error.stack);
      throw error;
    }
  }
}

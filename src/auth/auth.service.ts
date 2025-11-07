import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly usersService: UsersService) {}

  async login(payload: any) {
    this.logger.debug('login called — payload redacted');

    throw new UnauthorizedException('Auth not implemented yet');
  }
}

import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  BadRequestException,
  DuplicateException,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
  ValidationException,
} from 'src/common/exceptions/index';
import * as argon2 from 'argon2';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignupMode, User } from '@prisma/client';
import prisma from 'src/shared/service/client';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    public jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const googleConfig = this.configService.get('google');

    if (!googleConfig?.clientId || !googleConfig?.clientSecret) {
      this.logger.error('Google OAuth credentials are missing.');
      throw new InternalServerErrorException('OAuth configuration incomplete');
    }
    this.logger.log('Google OAuth credentials loaded successfully:', {
      clientId: googleConfig.clientId,
      callback: googleConfig.callBackURL,
    });
  }

  // async googleAuth() {
  //   const config = this.configService.get('google');
  // }
}

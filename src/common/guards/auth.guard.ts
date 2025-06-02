import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Users } from 'src/modules/auth/interfaces/user-login.interface';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import prisma from 'src/shared/service/client';
import { Request } from 'express';
import { changedPasswordAfter } from 'src/shared/utils/passwordUtil';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private logger = new Logger(JwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractJwtFromRequest(request);

    if (!token) {
      this.logger.warn('No token provided in request');
      throw new UnauthorizedException(
        'Access denied: No valid access token provided.',
      );
    }
    let decodedToken;
    try {
      decodedToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      this.logger.warn('Token verification failed', error);
      throw new UnauthorizedException('Access denied: Invalid token');
    }

    //check if user exist
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });
    if (!user) {
      this.logger.warn(`User with id ${decodedToken.id} not found`);
      throw new UnauthorizedException('Access denied: User not found');
    }

    if (
      user.passwordChangedAt &&
      changedPasswordAfter(user.passwordChangedAt, decodedToken.iat ?? 0)
    ) {
      throw new UnauthorizedException(
        'Access denied: Password changed recently, please log in again.',
      );
    }
    //attach user to request object for middlewares/controllers to use it
    request.user = user;
    return true;
  }

  private extractJwtFromRequest(request: Request): string | null {
    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer ')
    ) {
      return request.headers.authorization.split(' ')[1];
    }
    return null;
  }
}

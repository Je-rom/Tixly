import {
  CanActivate,
  ExecutionContext,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MethodGuard implements CanActivate {
  constructor(private readonly allowedMethods: string[]) {
    console.log(allowedMethods, 'allowedMethods');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log(request.method, 'request');

    if (!this.allowedMethods.includes(request.method)) {
      throw new MethodNotAllowedException(
        `Method ${request.method} not allowed`,
      );
    }
    return true;
  }
}

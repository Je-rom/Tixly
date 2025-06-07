import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/modules/roles/interfaces/role.interface';
import { ROLES_KEY } from '../decorators/role.decorators';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles || !Array.isArray(user.roles)) {
      throw new ForbiddenException(
        'You do not have the necessary permissions to access this resource',
      );
    }

    const userRoles = user.roles.map((roleObj: any) =>
      typeof roleObj === 'string' ? roleObj : roleObj.role,
    );

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the necessary permissions to access this resource',
      );
    }

    return true;
  }
}

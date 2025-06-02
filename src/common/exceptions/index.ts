import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class BaseCustomException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly errorCode?: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message, status);
  }
}

export class BadRequestException extends BaseCustomException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, HttpStatus.BAD_REQUEST, 'INVALID_REQUEST', context);
  }
}

export class ValidationException extends BaseCustomException {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'VALIDATION_FAILED',
      context,
    );
  }
}

export class ForbiddenException extends BaseCustomException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN_ACCESS', context);
  }
}

export class NotFoundException extends BaseCustomException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND', context);
  }
}

export class DuplicateException extends BaseCustomException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, 'DUPLICATE_RESOURCE', context);
  }
}

export class TooManyRequestsException extends BaseCustomException {
  constructor(
    message: string = 'Rate limit exceeded',
    context?: Record<string, any>,
  ) {
    super(
      message,
      HttpStatus.TOO_MANY_REQUESTS,
      'RATE_LIMIT_EXCEEDED',
      context,
    );
  }
}

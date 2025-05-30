import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MethodNotAllowedException } from '@nestjs/common';

@Catch(MethodNotAllowedException)
export class MethodNotAllowedFilter implements ExceptionFilter {
  catch(exception: MethodNotAllowedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      statusCode: HttpStatus.METHOD_NOT_ALLOWED,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Method Not Allowed',
    });
  }
}

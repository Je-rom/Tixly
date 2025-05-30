import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MethodNotAllowedMiddleware implements NestMiddleware {
  methods: string[];
  constructor(private allowedMethods: string[]) {
    this.methods = this.allowedMethods;
  }
  use(req: Request, res: Response, next: NextFunction) {
    if (!this.methods.includes(req.method)) {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    next();
  }
}

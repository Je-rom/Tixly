import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllHttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { json, urlencoded, NextFunction, Request, Response } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllHttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  //middleware: reject empty request bodies for POST/PUT
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      ['POST', 'PUT'].includes(req.method) &&
      !req.headers['content-type']?.includes('multipart') &&
      (!req.body || Object.keys(req.body).length === 0)
    ) {
      return res.status(400).json({
        message: 'Bad Request: Request body cannot be empty',
      });
    }
    next();
  });

  await app.listen(process.env.PORT ?? 9000);
}
bootstrap();

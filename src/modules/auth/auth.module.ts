import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import googleConfig from 'src/common/config/google.config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/shared/service/prisma.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { NotificationModule } from '../notification/notification.module';
import { TemplateService } from 'src/templates/template.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [googleConfig],
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    NotificationModule,
  ],
  providers: [AuthService, GoogleStrategy, PrismaService, TemplateService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}

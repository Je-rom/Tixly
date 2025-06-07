import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import googleConfig from 'src/common/config/google.config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/shared/service/prisma.service';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [googleConfig],
      isGlobal: true, // optional but good if config is used globally
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, GoogleStrategy, PrismaService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}

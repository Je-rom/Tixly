import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import googleConfig from 'src/common/config/google.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [googleConfig],
      envFilePath: '../../../env',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { SignupMode, User } from '@prisma/client';
import prisma from 'src/shared/service/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('google.clientId');
    const clientSecret = configService.get<string>('google.clientSecret');
    const callbackURL = configService.get<string>('google.callBackURL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing required Google OAuth configuration');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails, name } = profile;

      let user = await prisma.user.findFirst({
        where: {
          OR: [{ googleId: id }, { email: emails?.[0].value }],
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: id,
            email: emails?.[0].value,
            firstName: name?.givenName,
            secondName: name?.familyName,
            signUpMode: SignupMode.OAUTH, 
          },
        });
      } else if (!user.googleId) {
        //Update existing user with Google ID if they signed up with email/password first
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: id,
            signUpMode: SignupMode.OAUTH,
          },
        });
      }

      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { SignupMode, User } from '@prisma/client';
import prisma from 'src/shared/service/client';
import { InternalServerErrorException } from 'src/common/exceptions';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
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
      const { id: googleId, emails, name } = profile;
      const email = emails?.[0]?.value;

      //check if user exists by googleId or email
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ googleId }, { email }],
        },
        include: {
          roles: true,
        },
      });

      //if user does not exist, create new user with ATTENDEE role
      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId,
            email,
            firstName: name?.givenName,
            secondName: name?.familyName,
            signUpMode: SignupMode.OAUTH,
            roles: {
              create: [
                {
                  role: 'ATTENDEE',
                },
              ],
            },
          },
          include: {
            roles: true,
          },
        });
      }
      //if user exists but has no googleId, update it
      else if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
          },
          include: {
            roles: true,
          },
        });
      }

      done(null, user);
    } catch (err) {
      console.error('Google OAuth validation error:', err);
      done(err, false);
    }
  }
}

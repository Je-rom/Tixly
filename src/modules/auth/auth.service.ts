import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  BadRequestException,
  DuplicateException,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
  ValidationException,
} from 'src/common/exceptions/index';
import * as argon2 from 'argon2';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignupMode, User } from '@prisma/client';
import prisma from 'src/shared/service/client';
import { RegiserUserDto } from '../user/dto/create-user.dto';
import { Role } from '../roles/interfaces/role.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    public jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const googleConfig = this.configService.get('google');

    if (!googleConfig?.clientId || !googleConfig?.clientSecret) {
      this.logger.error('Google OAuth credentials are missing.');
      throw new InternalServerErrorException('OAuth configuration incomplete');
    }
    // this.logger.log('Google OAuth credentials loaded successfully:', {
    //   clientId: googleConfig.clientId,
    //   callback: googleConfig.callBackURL,
    // });
  }

  async generateJwtToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.secondName,
      signUpMode: user.signUpMode,
    };
    return this.jwtService.sign(payload);
  }

  async registerUser(regiserUserDto: RegiserUserDto) {
    const ifEmailExist = await prisma.user.findFirst({
      where: {
        email: regiserUserDto.email,
      },
    });

    if (ifEmailExist) {
      throw new DuplicateException(
        `A user with this email: ${ifEmailExist.email} already exists`,
      );
    }

    const hashPassword = await argon2.hash(regiserUserDto.password);

    const rolesToCreate = regiserUserDto.roles.map((role) => ({
      role,
    }));

    const newUser = await prisma.user.create({
      data: {
        email: regiserUserDto.email,
        password: hashPassword,
        firstName: regiserUserDto.firstName,
        secondName: regiserUserDto.secondName,
        signUpMode: SignupMode.REGULAR,
        roles: {
          create: rolesToCreate,
        },

        //conditionally create organizerProfile
        ...(regiserUserDto.roles.includes(Role.ORGANIZER) &&
          regiserUserDto.organizerProfile && {
            organizerProfile: {
              create: {
                companyName: regiserUserDto.organizerProfile.companyName,
                websiteUrl: regiserUserDto.organizerProfile.websiteUrl,
                businessType: regiserUserDto.organizerProfile.businessType,
                country: regiserUserDto.organizerProfile.country,
                socialLinks: regiserUserDto.organizerProfile.socialLinks
                  ? JSON.stringify(regiserUserDto.organizerProfile.socialLinks)
                  : undefined,
              },
            },
          }),

        //conditionally create podcasterProfile
        ...(regiserUserDto.roles.includes(Role.PODCASTER) &&
          regiserUserDto.podcasterProfile && {
            podcasterProfile: {
              create: {
                podcastName: regiserUserDto.podcasterProfile.podcastName,
                hostNames: regiserUserDto.podcasterProfile.hostNames,
                websiteUrl: regiserUserDto.podcasterProfile.websiteUrl,
                country: regiserUserDto.podcasterProfile.country,
                socialLinks: regiserUserDto.podcasterProfile.socialLinks
                  ? JSON.stringify(regiserUserDto.podcasterProfile.socialLinks)
                  : undefined,
              },
            },
          }),
      },

      include: {
        roles: true,
        organizerProfile: true,
        podcasterProfile: true,
      },
    });

    return newUser;
  }
}

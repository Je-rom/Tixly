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
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LoginResponseDto } from 'src/shared/interfaces';

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
    return this.jwtService.signAsync(payload);
  }

  async registerUser(
    regiserUserDto: RegiserUserDto,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: regiserUserDto.email,
      },
    });

    if (existingUser) {
      throw new DuplicateException(
        `A user with this email: ${existingUser.email} already exists`,
      );
    }

    const hashPassword = await argon2.hash(regiserUserDto.password);

    const newUser = await prisma.user.create({
      data: {
        email: regiserUserDto.email,
        password: hashPassword,
        firstName: regiserUserDto.firstName,
        secondName: regiserUserDto.secondName,
        signUpMode: SignupMode.REGULAR,
        userRole: {
          create: {
            role: regiserUserDto.role,
          },
        },

        //conditionally create organizerProfile
        ...(regiserUserDto.role.includes(Role.ORGANIZER) &&
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
      },

      include: {
        userRole: true,
        organizerProfile: true,
      },
    });
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const user = await prisma.user.findFirst({
      where: {
        email: loginUserDto.email,
      },
      include: {
        userRole: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Incorrect username or password');
    }

    if (!user.password) {
      throw new BadRequestException('Password is required');
    }

    const checkPassword = await argon2.verify(
      user.password,
      loginUserDto.password,
    );
    if (!checkPassword) {
      throw new UnauthorizedException(
        'Invalid Password, please enter your correct password',
      );
    }
    const payload = {
      sub: user.id,
      firstname: user.firstName,
      lastname: user.secondName,
      email: user.email,
      role: user.userRole?.role ?? null,
    };

    const access_token = await this.jwtService.signAsync(payload);
    return {
      token: access_token,
      user: {
        id: user.id,
        firstName: user.firstName,
        secondName: user.secondName,
        email: user.email,
        role: user.userRole?.role ?? null,
      },
    };
  }
}

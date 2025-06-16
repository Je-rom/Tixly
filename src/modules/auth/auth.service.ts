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
import * as crypto from 'crypto';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignupMode, User } from '@prisma/client';
import prisma from 'src/shared/service/client';
import { RegiserUserDto } from '../user/dto/create-user.dto';
import { Role } from '../roles/interfaces/role.interface';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LoginResponseDto } from 'src/shared/interfaces';
import { NotificationService } from '../notification/notification.service';
import { TemplateService } from 'src/templates/template.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    public jwtService: JwtService,
    private configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly templateService: TemplateService,
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
  ): Promise<{ message: string; email: string }> {
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

    if (
      regiserUserDto.role === Role.ORGANIZER &&
      !regiserUserDto.organizerProfile
    ) {
      throw new BadRequestException(
        'Organizer profile is required when registering as an organizer',
      );
    }

    if (
      regiserUserDto.role === Role.ATTENDEE &&
      regiserUserDto.organizerProfile
    ) {
      throw new BadRequestException(
        'Attendee users cannot have an organizer profile',
      );
    }
    const hashPassword = await argon2.hash(regiserUserDto.password);

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        email: regiserUserDto.email,
        password: hashPassword,
        firstName: regiserUserDto.firstName,
        secondName: regiserUserDto.secondName,
        signUpMode: SignupMode.REGULAR,
        active: false,
        emailVerificationToken,
        emailTokenExpires,
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

    const verificationUrl = `http://localhost:9000/verify-email?token=${emailVerificationToken}`;

    const html = await this.templateService.getEmailVerificationTemplate({
      firstName: newUser.firstName,
      verificationUrl,
    });

    await this.notificationService.sendEmail(
      newUser.email,
      'Verify your Crowdia account',
      `Hi ${newUser.firstName}, please verify your account using this link: ${verificationUrl}`,
      html,
    );

    return {
      message:
        'Registration successful – check your inbox to verify your e‑mail',
      email: newUser.email,
    };
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const user = await prisma.user.findFirst({
      where: {
        email: loginUserDto.email,
      },
      include: {
        userRole: true,
        organizerProfile: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Incorrect username or password');
    }

    if (!user.active) {
      throw new ForbiddenException(
        'Account not verified ‑ please check your e‑mail for the activation link',
      );
    }
    if (user.signUpMode !== SignupMode.REGULAR) {
      throw new BadRequestException('Use Google login');
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

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    //store refresh token in database (hashed for security)
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        secondName: user.secondName,
        email: user.email,
        userRole: user.userRole,
        googleId: user.googleId,
        passwordChangedAt: user.passwordChangedAt,
        organizerProfile: user.organizerProfile,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        signUpMode: user.signUpMode,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      //verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken);

      //get user and verify stored refresh token
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRole: true,
        },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await argon2.verify(
        user.refreshToken,
        refreshToken,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      //new access token
      const newPayload = {
        sub: user.id,
        firstname: user.firstName,
        lastname: user.secondName,
        email: user.email,
        role: user.userRole?.role ?? null,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyEmailToken(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailTokenExpires: {
          gte: new Date(),
        },
        active: false,
      },
    });

    if (!user) {
      throw new BadRequestException('Link is invalid or has expired');
    }

    if (user.active) {
      throw new BadRequestException('Account is already verified');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        active: true,
        emailVerificationToken: null,
        emailTokenExpires: null,
      },
    });
  }

  async logout(userId: string): Promise<{ message: string }> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Successfully logged out' };
  }
}

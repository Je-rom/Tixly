import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegiserUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ForgotPasswordDto } from '../user/dto/forgot-password.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    const user = req.user;
    const token = await this.authService.generateJwtToken(user);

    // res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    res.json({
      message: 'Google login successful',
      token,
      user,
    });
  }

  @Post('register')
  async registerUser(@Req() req, @Body() registerUser: RegiserUserDto) {
    const registeredUser = await this.authService.registerUser(registerUser);
    return {
      data: registeredUser,
    };
  }

  @Post('login')
  async loginUser(@Body() loginUser: LoginUserDto) {
    const loggedInUser = await this.authService.loginUser(loginUser);
    return {
      message: 'User successfully logged in',
      data: loggedInUser,
    };
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return await this.authService.refreshToken(body.refreshToken);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    await this.authService.verifyEmailToken(token);
    return res.json({
      success: true,
      message: 'Email verified successfully! Account is now active.',
    });
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPassword: ForgotPasswordDto,
    @Req() req: Request,
  ) {
    return await this.authService.forgotPassword(forgotPassword, req);
  }
}

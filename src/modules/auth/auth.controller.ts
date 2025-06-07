import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegiserUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    return await this.authService.registerUser(registerUser);
  }
}

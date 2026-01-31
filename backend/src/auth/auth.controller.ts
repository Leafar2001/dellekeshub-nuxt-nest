import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from 'src/middleware/roles.decorator';
import { JwtAuthGuard } from 'src/middleware/jwt-auth.guard';
import { RolesGuard } from 'src/middleware/roles.guard';
import type { Response } from 'express';
import { createZodValidationPipe } from '../utils/zod-validation';
import {
  type RegistrationRequest,
  RegistrationRequestSchema,
} from './validation/registration-schema';
import {
  type LoginRequest,
  LoginRequestSchema,
} from './validation/login-schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getUser(@Req() req) {
    return req.user;
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async register(
    @Body(createZodValidationPipe(RegistrationRequestSchema))
    body: RegistrationRequest,
  ) {
    const user = await this.authService.register(body.username, body.password);
    console.log('New registered user:', user);
    if (user) return user;
  }

  @Post('login')
  async login(
    @Body(createZodValidationPipe(LoginRequestSchema)) body: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const accessToken = this.authService.getAccessToken(payload);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // TODO: set true in production (HTTPS)
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return { message: 'Logged in' };
  }
}

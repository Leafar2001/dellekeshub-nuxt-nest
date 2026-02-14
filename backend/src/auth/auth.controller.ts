import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from 'src/auth/middleware/roles.decorator';
import { RolesGuard } from 'src/auth/middleware/roles.guard';
import { createZodValidationPipe } from '../lib/utils/zod-validation';
import {
  type RegistrationRequest,
  RegistrationRequestSchema,
} from './validation/registration-schema';
import {
  type LoginRequest,
  LoginRequestSchema,
} from './validation/login-schema';
import { SessionAuthGuard } from './middleware/session.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(SessionAuthGuard)
  getUser(@Req() req: Request) {
    const userId = req.session.userId;
    return { userId }; // TODO: Return user from DB
  }

  @Post('register')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles('admin')
  async register(
    @Body(createZodValidationPipe(RegistrationRequestSchema))
    body: RegistrationRequest,
  ) {
    const user = await this.authService.register(body);
    this.logger.log('New registered user:', user);
    if (user) return user;
  }

  @Post('login')
  async login(
    @Body(createZodValidationPipe(LoginRequestSchema)) body: LoginRequest,
    @Req() req: Request,
  ) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );

    req.session.userId = user._id.toString();
    req.session.role = user.role;

    return { success: true };
  }

  @Post('logout')
  logout(@Req() req: Request) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err instanceof Error ? err : new Error(String(err)));
        resolve({ success: true });
      });
    });
  }
}

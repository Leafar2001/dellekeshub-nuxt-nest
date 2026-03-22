import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Roles } from 'src/auth/middleware/roles.decorator';
import { RolesGuard } from 'src/auth/middleware/roles.guard';
import { SessionAuthGuard } from './middleware/session.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import type { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @ApiCookieAuth('sid')
  @Get('me')
  @UseGuards(SessionAuthGuard)
  async getUser(@Req() req: Request) {
    const userId = req.session.userId!;
    return this.authService.getFullUserData(userId);
  }

  @ApiCookieAuth('sid')
  @Post('register')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles('admin')
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body.username, body.password);
    this.logger.log('New registered user:', user);
    if (user) return user;
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    return { success: true };
  }

  @ApiCookieAuth('sid')
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

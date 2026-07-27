import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/middleware/roles.decorator';
import { RolesGuard } from '../auth/middleware/roles.guard';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  getMe(@Session() session: UserSession) {
    return session.user;
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('id/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get(':username')
  getUserByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }
}

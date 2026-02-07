import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/middleware/roles.decorator';
import { RolesGuard } from 'src/auth/middleware/roles.guard';
import { SessionAuthGuard } from '../auth/middleware/session.guard';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('all')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles('admin')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('id/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles('admin')
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get(':username')
  @UseGuards(SessionAuthGuard)
  getUserByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username); // TODO: Check if user is admin or self. Because this allows to get any user when authenticated.
  }
}

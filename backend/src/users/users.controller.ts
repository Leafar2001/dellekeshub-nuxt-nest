import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/middleware/jwt-auth.guard';
import { Roles } from 'src/middleware/roles.decorator';
import { RolesGuard } from 'src/middleware/roles.guard';


@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  getUserByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  

  
}

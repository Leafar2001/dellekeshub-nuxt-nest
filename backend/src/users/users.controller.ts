import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/middleware/roles.decorator';
import { RolesGuard } from '../auth/middleware/roles.guard';
import { AllowAnonymous, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { createZodValidationPipe } from '../lib/utils/zod-validation';
import {
  type CreateUser,
  CreateUserSchema,
} from './validation/create-user-schema';
import {
  type RegisterUser,
  RegisterUserSchema,
} from './validation/register-user-schema';
import { type UpdateMe, UpdateMeSchema } from './validation/update-me-schema';
import {
  type UpdateUser,
  UpdateUserSchema,
} from './validation/update-user-schema';
import { FavoritesService } from '../favorites/favorites.service';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private favoritesService: FavoritesService,
  ) {}

  @Get('me')
  getMe(@Session() session: UserSession) {
    return session.user;
  }

  @Patch('me')
  updateMe(
    @Session() session: UserSession,
    @Body(createZodValidationPipe(UpdateMeSchema)) body: UpdateMe,
  ) {
    return this.userService.updateMe(session.user.id, body);
  }

  @Post('register')
  @AllowAnonymous()
  register(
    @Body(createZodValidationPipe(RegisterUserSchema)) body: RegisterUser,
  ) {
    return this.userService.register(body);
  }

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles('admin')
  createUser(
    @Body(createZodValidationPipe(CreateUserSchema)) body: CreateUser,
  ) {
    return this.userService.createUser(body);
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

  @Patch('id/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateUser(
    @Param('id') id: string,
    @Body(createZodValidationPipe(UpdateUserSchema)) body: UpdateUser,
  ) {
    return this.userService.updateUser(id, body);
  }

  @Delete('id/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  deleteUser(@Param('id') id: string, @Session() session: UserSession) {
    return this.userService.deleteUser(id, session.user.id);
  }

  @Get(':username')
  getUserByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Get(':username/favorites')
  getFavoritesByUsername(@Param('username') username: string) {
    return this.favoritesService.getFavoritesByUsername(username);
  }
}

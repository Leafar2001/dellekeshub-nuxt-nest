import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../auth/middleware/roles.guard';
import { Roles } from '../auth/middleware/roles.decorator';
import { InvitesService } from './invites.service';

@Controller('invites')
@UseGuards(RolesGuard)
@Roles('admin')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get()
  findAll() {
    return this.invitesService.findAll();
  }

  @Post()
  create(@Session() session: UserSession) {
    return this.invitesService.create(session.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invitesService.remove(id);
  }
}

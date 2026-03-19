import { Controller, Get, Patch, Param, Req, UseGuards, Logger, Body } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { UserProfilesService, UpdateProfileData } from './user-profiles.service';
import { SessionAuthGuard } from '../auth/middleware/session.guard';
import { UpdateProfileDto } from './dto/profile.dto';
import type { Request } from 'express';

@ApiTags('profiles')
@ApiCookieAuth('sid')
@Controller('profiles')
export class UserProfilesController {
  private readonly logger = new Logger(UserProfilesController.name);

  constructor(private profilesService: UserProfilesService) {}

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async getMyProfile(@Req() req: Request) {
    const userId = req.session.userId!;
    let profile = await this.profilesService.findByUserId(userId);
    if (!profile) {
      profile = await this.profilesService.createOrGet(userId);
    }
    return profile;
  }

  @Patch('me')
  @UseGuards(SessionAuthGuard)
  async updateMyProfile(@Req() req: Request, @Body() body: UpdateProfileDto) {
    const userId = req.session.userId!;
    const profile = await this.profilesService.update(userId, body as UpdateProfileData);
    this.logger.log(`Updated profile for user: ${userId}`);
    return profile;
  }

  @Get(':userId')
  @UseGuards(SessionAuthGuard)
  async getUserProfile(@Param('userId') userId: string) {
    const profile = await this.profilesService.getPublicProfile(userId);
    if (!profile) {
      return { displayName: '', avatarB64: '', bio: '' };
    }
    return profile;
  }
}

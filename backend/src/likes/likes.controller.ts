import { Controller, Get, Post, Delete, Param, Req, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { SessionAuthGuard } from '../auth/middleware/session.guard';
import { CollectionService } from '../collections/services/collection.service';
import type { Request } from 'express';

@ApiTags('likes')
@ApiCookieAuth('sid')
@Controller('likes')
@UseGuards(SessionAuthGuard)
export class LikesController {
  private readonly logger = new Logger(LikesController.name);

  constructor(
    private likesService: LikesService,
    private collectionsService: CollectionService,
  ) {}

  @Get('user')
  async getUserLikes(@Req() req: Request) {
    const userId = req.session.userId!;
    const mediaIds = await this.likesService.getUserLikes(userId);
    return this.collectionsService.findByIds(mediaIds.map((id) => id.toString()));
  }

  @Get(':mediaId')
  async getLikeStatus(@Param('mediaId') mediaId: string, @Req() req: Request) {
    const userId = req.session.userId!;
    return this.likesService.getLikeStatus(userId, mediaId);
  }

  @Post(':mediaId')
  async likeMedia(@Param('mediaId') mediaId: string, @Req() req: Request) {
    const userId = req.session.userId!;
    this.logger.log(`User ${userId} liking media ${mediaId}`);
    return this.likesService.like(userId, mediaId);
  }

  @Delete(':mediaId')
  async unlikeMedia(@Param('mediaId') mediaId: string, @Req() req: Request) {
    const userId = req.session.userId!;
    this.logger.log(`User ${userId} unliking media ${mediaId}`);
    return this.likesService.unlike(userId, mediaId);
  }
}

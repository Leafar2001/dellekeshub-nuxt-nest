import { Controller, Get, Param, Query, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { CollectionService } from '../collections/services/collection.service';
import { LikesService } from '../likes/likes.service';
import { WatchlistService } from '../watchlist/watchlist.service';
import { ReviewsService } from '../reviews/reviews.service';
import { SessionAuthGuard } from '../auth/middleware/session.guard';
import type { Request } from 'express';

@ApiTags('media')
@ApiCookieAuth('sid')
@Controller('media')
@UseGuards(SessionAuthGuard)
export class MediaController {
  constructor(
    private collectionsService: CollectionService,
    private likesService: LikesService,
    private watchlistService: WatchlistService,
    private reviewsService: ReviewsService,
  ) {}

  @Get('search')
  async searchMedia(
    @Query('q') query?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: 'movie' | 'series',
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;

    if (!query || query.trim() === '') {
      const result = await this.collectionsService.findAll(limitNum);
      return result.collections;
    }

    const result = await this.collectionsService.findCollectionsByTitle(query, limitNum);
    let collections = result.collections;

    if (type) {
      collections = collections.filter((c) => c.type === type);
    }

    return collections;
  }

  @Get(':id')
  async getMedia(@Param('id') id: string, @Req() req: Request) {
    const userId = req.session.userId!;
    const collection = await this.collectionsService.findCollectionById(id);

    if (!collection) {
      throw new NotFoundException('Media not found');
    }

    const [likeStatus, watchlistStatus, averageRating] = await Promise.all([
      this.likesService.getLikeStatus(userId, id),
      this.watchlistService.getWatchlistStatus(userId, id),
      this.reviewsService.getAverageRating(id),
    ]);

    return {
      ...collection.toObject(),
      likeStatus,
      watchlistStatus,
      averageRating,
    };
  }
}

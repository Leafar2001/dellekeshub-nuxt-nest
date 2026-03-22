import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';
import { SessionAuthGuard } from '../auth/middleware/session.guard';
import type { Request } from 'express';

@ApiTags('watchlist')
@ApiCookieAuth('sid')
@Controller('watchlist')
@UseGuards(SessionAuthGuard)
export class WatchlistController {
  private readonly logger = new Logger(WatchlistController.name);

  constructor(private watchlistService: WatchlistService) {}

  @Get()
  async getWatchlist(@Req() req: Request) {
    const userId = req.session.userId!;
    return this.watchlistService.getUserWatchlist(userId);
  }

  @Get(':mediaId')
  async getWatchlistStatus(
    @Param('mediaId') mediaId: string,
    @Req() req: Request,
  ) {
    const userId = req.session.userId!;
    return this.watchlistService.getWatchlistStatus(userId, mediaId);
  }

  @Post(':mediaId')
  async addToWatchlist(@Param('mediaId') mediaId: string, @Req() req: Request) {
    const userId = req.session.userId!;
    this.logger.log(`User ${userId} adding media ${mediaId} to watchlist`);
    return this.watchlistService.add(userId, mediaId);
  }

  @Delete(':mediaId')
  async removeFromWatchlist(
    @Param('mediaId') mediaId: string,
    @Req() req: Request,
  ) {
    const userId = req.session.userId!;
    this.logger.log(`User ${userId} removing media ${mediaId} from watchlist`);
    return this.watchlistService.remove(userId, mediaId);
  }
}

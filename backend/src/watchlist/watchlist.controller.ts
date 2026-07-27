import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { WatchlistService } from './watchlist.service';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  getWatchlist(@Session() session: UserSession) {
    return this.watchlistService.getWatchlist(session.user.id);
  }

  @Post(':collectionId')
  add(
    @Param('collectionId') collectionId: string,
    @Session() session: UserSession,
  ) {
    return this.watchlistService.add(session.user.id, collectionId);
  }

  @Delete(':collectionId')
  remove(
    @Param('collectionId') collectionId: string,
    @Session() session: UserSession,
  ) {
    return this.watchlistService.remove(session.user.id, collectionId);
  }
}

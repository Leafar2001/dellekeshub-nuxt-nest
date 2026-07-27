import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@Session() session: UserSession) {
    return this.favoritesService.getFavorites(session.user.id);
  }

  @Post(':collectionId')
  add(
    @Param('collectionId') collectionId: string,
    @Session() session: UserSession,
  ) {
    return this.favoritesService.add(session.user.id, collectionId);
  }

  @Delete(':collectionId')
  remove(
    @Param('collectionId') collectionId: string,
    @Session() session: UserSession,
  ) {
    return this.favoritesService.remove(session.user.id, collectionId);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { RolesGuard } from '../../auth/middleware/roles.guard';
import { Roles } from '../../auth/middleware/roles.decorator';
import { CollectionService } from '../services/collection.service';
import {
  keyToPagination,
  paginationToKey,
} from '../../lib/utils/pagination-utils';
import {
  type CreateCollectionRequest,
  CreateCollectionRequestSchema,
} from '../validation/create-collection-request-schema';
import { createZodValidationPipe } from '../../lib/utils/zod-validation';
import {
  type UpdateCollectionRequest,
  UpdateCollectionRequestSchema,
} from '../validation/update-collection-request-schema';
import { IndexingService } from '../services/indexing.service';
import { WatchlistService } from '../../watchlist/watchlist.service';
import { FavoritesService } from '../../favorites/favorites.service';

@Controller('collections')
export class CollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly indexationService: IndexingService,
    private readonly watchlistService: WatchlistService,
    private readonly favoritesService: FavoritesService,
  ) {}

  @Get('all')
  async findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('lastKey') lastKey?: string,
    @Query('genre') genre?: string,
  ) {
    const pagination = lastKey ? keyToPagination(lastKey) : undefined;

    const { collections, pagination: nextPagination } =
      await this.collectionService.findAll(limit, pagination, genre);

    const nextKey = nextPagination
      ? paginationToKey(nextPagination)
      : undefined;

    return { collections, nextKey };
  }

  @Get('genres')
  findAllGenres() {
    return this.collectionService.findAllGenres();
  }

  @Get('continue-watching')
  findContinueWatching(
    @Session() session: UserSession,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.collectionService.findContinueWatching(session.user.id, limit);
  }

  @Get('trending')
  findTrending(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.collectionService.findTrending(limit);
  }

  @Get('top-rated')
  findTopRated(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.collectionService.findTopRated(limit);
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('lastKey') lastKey?: string,
  ) {
    if (!q) return { collections: [], nextKey: undefined };

    const pagination = lastKey ? keyToPagination(lastKey) : undefined;

    const { collections, pagination: nextPagination } =
      await this.collectionService.findCollectionsByTitle(q, limit, pagination);

    const nextKey = nextPagination
      ? paginationToKey(nextPagination)
      : undefined;

    return { collections, nextKey };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(
    @Body(createZodValidationPipe(CreateCollectionRequestSchema))
    body: CreateCollectionRequest,
  ) {
    const collection = await this.collectionService.createCollection(body);
    const title = collection.title['en-US'];

    if (title) await this.indexationService.indexCollection(title);

    return { success: true };
  }

  @Patch(':id/reindex')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async index(@Param('id') id: string) {
    const collection = await this.collectionService.findCollectionById(id);
    const title = collection?.title['en-US'];

    if (title) await this.indexationService.indexCollection(title);

    return { success: true };
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Session() session: UserSession) {
    const collection = await this.collectionService.findCollectionById(id);

    if (!collection) return null;

    const [inWatchlist, isFavorite] = await Promise.all([
      this.watchlistService.isInWatchlist(session.user.id, id),
      this.favoritesService.isFavorite(session.user.id, id),
    ]);

    return { ...collection, inWatchlist, isFavorite };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body(createZodValidationPipe(UpdateCollectionRequestSchema))
    body: UpdateCollectionRequest,
  ) {
    return this.collectionService.updateCollection(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.collectionService.deleteCollection(id);
  }
}

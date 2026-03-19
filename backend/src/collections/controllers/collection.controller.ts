import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { SessionAuthGuard } from '../../auth/middleware/session.guard';
import { RolesGuard } from '../../auth/middleware/roles.guard';
import { Roles } from '../../auth/middleware/roles.decorator';
import { CollectionService } from '../services/collection.service';
import { keyToPagination, paginationToKey } from '../../lib/utils/pagination-utils';
import { IndexingService } from '../services/indexing.service';
import { CreateCollectionDto, UpdateCollectionDto } from '../dto/collection.dto';

@ApiTags('collections')
@ApiCookieAuth('sid')
@Controller('collections')
@UseGuards(SessionAuthGuard)
export class CollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly indexationService: IndexingService,
  ) {}

  @Get('all')
  async findAll(@Query('limit') limit?: number, @Query('lastKey') lastKey?: string) {
    const pagination = lastKey ? keyToPagination(lastKey) : undefined;
    const { collections, pagination: nextPagination } = await this.collectionService.findAll(limit, pagination);
    const nextKey = nextPagination ? paginationToKey(nextPagination) : undefined;
    return { collections, nextKey };
  }

  @Get('search')
  async search(@Query('q') q: string, @Query('limit') limit?: number, @Query('lastKey') lastKey?: string) {
    if (!q) return [];
    const pagination = lastKey ? keyToPagination(lastKey) : undefined;
    const { collections, pagination: nextPagination } = await this.collectionService.findCollectionsByTitle(q, limit, pagination);
    const nextKey = nextPagination ? paginationToKey(nextPagination) : undefined;
    return { collections, nextKey };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() body: CreateCollectionDto) {
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
  async findById(@Param('id') id: string) {
    return this.collectionService.findCollectionById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: UpdateCollectionDto) {
    return this.collectionService.updateCollection(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.collectionService.deleteCollection(id);
  }
}

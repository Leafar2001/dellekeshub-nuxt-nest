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
} from '@nestjs/common';
import { SessionAuthGuard } from '../../auth/middleware/session.guard';
import { RolesGuard } from '../../auth/middleware/roles.guard';
import { Roles } from '../../auth/middleware/roles.decorator';
import { CollectionService } from '../services/collection.service';
import {
  keyToPagination,
  paginationToKey,
} from '../../lib/utils/pagination-utils';
import {
  type CreateCollection,
  CreateCollectionSchema,
} from '../validation/create-collection-schema';
import { createZodValidationPipe } from '../../lib/utils/zod-validation';
import {
  type UpdateCollection,
  UpdateCollectionSchema,
} from '../validation/update-collection-schema';
import { IndexingService } from '../services/indexing.service';
import * as querystring from 'node:querystring';

@Controller('collections')
@UseGuards(SessionAuthGuard)
export class CollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly indexationService: IndexingService,
  ) {}

  @Get('all')
  async findAll(
    @Query('limit') limit?: number,
    @Query('lastKey') lastKey?: string,
  ) {
    const pagination = lastKey ? keyToPagination(lastKey) : undefined;

    const { collections, pagination: nextPagination } =
      await this.collectionService.findAll(limit, pagination);

    const nextKey = nextPagination
      ? paginationToKey(nextPagination)
      : undefined;

    return {
      collections,
      nextKey,
    };
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('limit') limit?: number,
    @Query('lastKey') lastKey?: string,
  ) {
    if (!q) return [];

    const pagination = lastKey ? keyToPagination(lastKey) : undefined;

    const { collections, pagination: nextPagination } =
      await this.collectionService.findCollectionByTitle(q, limit, pagination);

    const nextKey = nextPagination
      ? paginationToKey(nextPagination)
      : undefined;

    return {
      collections,
      nextKey,
    };
  }

  @Get('index') // TODO: Only for testing
  async index(@Query('q') q: string) {
    await this.indexationService.indexCollection(q);

    return { success: true };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(
    @Body(createZodValidationPipe(CreateCollectionSchema))
    body: CreateCollection,
  ) {
    return this.collectionService.createCollection(body);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.collectionService.findCollectionById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body(createZodValidationPipe(UpdateCollectionSchema))
    body: UpdateCollection,
  ) {
    return this.collectionService.updateCollection(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.collectionService.deleteCollection(id);
  }
}

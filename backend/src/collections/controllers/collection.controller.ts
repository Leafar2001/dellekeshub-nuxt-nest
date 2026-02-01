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
import { JwtAuthGuard } from '../../middleware/jwt-auth.guard';
import { RolesGuard } from '../../middleware/roles.guard';
import { Roles } from '../../middleware/roles.decorator';
import { CollectionService } from '../services/collection.service';
import {
  keyToPagination,
  paginationToKey,
} from '../../lib/utils/pagination-utils';
import {
  type CreateCollectionRequest,
  CreateCollectionRequestSchema,
} from '../types/create-collection-schema';
import { createZodValidationPipe } from '../../lib/utils/zod-validation';
import {
  type UpdateCollectionRequest,
  UpdateCollectionRequestSchema,
} from '../types/update-collection-schema';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

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

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(
    @Body(createZodValidationPipe(CreateCollectionRequestSchema))
    body: CreateCollectionRequest,
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
    @Body(createZodValidationPipe(UpdateCollectionRequestSchema))
    body: UpdateCollectionRequest,
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

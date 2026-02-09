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
  type CreateCollectionRequest,
  CreateCollectionRequestSchema,
} from '../validation/create-collection-request-schema';
import { createZodValidationPipe } from '../../lib/utils/zod-validation';
import {
  type UpdateCollectionRequest,
  UpdateCollectionRequestSchema,
} from '../validation/update-collection-request-schema';
import { IndexingService } from '../services/indexing.service';

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
      await this.collectionService.findCollectionsByTitle(q, limit, pagination);

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

import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Collection, CollectionDocument } from '../schemas/collection.schema';
import { Model } from 'mongoose';
import { Pagination } from '../../lib/types/pagination';
import { queryResultToPagination } from '../../lib/utils/pagination-utils';
import { CreateCollectionRequest } from '../types/create-collection-schema';
import { UpdateCollectionRequest } from '../types/update-collection-schema';
import { generateSlugLocalizedString } from '../../lib/utils/slug-utils';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name)
    private collectionModel: Model<CollectionDocument>,
  ) {}

  async findAll(
    limit: number = 20,
    pagination?: Pagination,
  ): Promise<{
    collections: CollectionDocument[];
    pagination: Pagination | undefined;
  }> {
    const query = pagination
      ? {
          $or: [
            { createdAt: { $lt: pagination.createdAt } },
            {
              createdAt: pagination.createdAt,
              _id: { $lt: pagination.lastId },
            },
          ],
        }
      : undefined;

    const queryResult = await this.collectionModel
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .exec();

    return {
      collections: queryResult,
      pagination: queryResultToPagination(queryResult),
    };
  }

  async findCollectionById(id: string) {
    return this.collectionModel.findById(id);
  }

  async findCollectionByTitle(
    title: string,
    limit: number = 20,
    pagination?: Pagination,
  ): Promise<{
    collections: CollectionDocument[];
    pagination: Pagination | undefined;
  }> {
    const regex = new RegExp(title.split('').join('.*'), 'i');

    const query = pagination
      ? {
          'title.en-US': { $regex: regex },
          $or: [
            { createdAt: { $lt: pagination.createdAt } },
            {
              createdAt: pagination.createdAt,
              _id: { $lt: pagination.lastId },
            },
          ],
        }
      : {
          'title.en-US': { $regex: regex },
        };

    const queryResult = await this.collectionModel
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .exec();

    return {
      collections: queryResult,
      pagination: queryResultToPagination(queryResult),
    };
  }

  async createCollection(body: CreateCollectionRequest) {
    const existingCollection = await this.collectionModel.findOne({
      'title.en-US': body.title['en-US'],
    });

    if (existingCollection) {
      throw new ConflictException('Collection title already exists');
    }

    // TODO: Index videos

    return this.collectionModel.create({
      ...body,
      slug: generateSlugLocalizedString(body.title),
    });
  }

  async updateCollection(id: string, body: UpdateCollectionRequest) {
    return this.collectionModel.findByIdAndUpdate(
      id,
      {
        ...body,
        slug: body.title ? generateSlugLocalizedString(body.title) : undefined,
      },
      { new: true },
    );
  }

  async deleteCollection(id: string) {
    return this.collectionModel.findByIdAndDelete(id);
  }
}

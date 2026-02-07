import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Collection,
  CollectionDocument,
} from '../persistence/collection.schema';
import { Model } from 'mongoose';
import { Pagination } from '../../lib/validation/pagination';
import { queryResultToPagination } from '../../lib/utils/pagination-utils';
import { CreateCollection } from '../validation/create-collection-schema';
import { UpdateCollection } from '../validation/update-collection-schema';
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

  async createCollection(body: CreateCollection): Promise<CollectionDocument> {
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

  async updateCollection(
    id: string,
    body: UpdateCollection,
  ): Promise<CollectionDocument | null> {
    return this.collectionModel.findByIdAndUpdate(
      id,
      {
        ...body,
        slug: body.title ? generateSlugLocalizedString(body.title) : undefined,
      },
      { new: true },
    );
  }

  async deleteCollection(id: string): Promise<CollectionDocument | null> {
    return this.collectionModel.findByIdAndDelete(id);
  }

  async addVideoToCollection(
    collectionId: string,
    videoId: string,
    episodeNumber: number,
    seasonNumber?: number,
  ) {
    if (seasonNumber === undefined) {
      return this.collectionModel.findByIdAndUpdate(
        collectionId,
        {
          $push: {
            videos: { episodeNumber, videoId },
          },
        },
        { new: true },
      );
    }

    // Try to push episode into existing season
    const updated = await this.collectionModel.findOneAndUpdate(
      {
        _id: collectionId,
        'seasons.seasonNumber': seasonNumber,
      },
      {
        $push: {
          'seasons.$.episodes': { episodeNumber, videoId },
        },
      },
      { new: true },
    );

    if (updated) {
      return updated;
    }

    // Season does not exist → create it
    return this.collectionModel.findByIdAndUpdate(
      collectionId,
      {
        $push: {
          seasons: {
            seasonNumber,
            episodes: [{ episodeNumber, videoId }],
          },
        },
      },
      { new: true },
    );
  }
}

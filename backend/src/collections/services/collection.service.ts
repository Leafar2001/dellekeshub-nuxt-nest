import { ConflictException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  Collection,
  CollectionDocument,
  CollectionVideo,
  CollectionVideoDocument,
  Season,
  SeasonDocument,
} from '../persistence/collection.schema';
import { Model } from 'mongoose';
import { Pagination } from '../../lib/validation/pagination';
import { queryResultToPagination } from '../../lib/utils/pagination-utils';
import { CreateCollectionRequest } from '../validation/create-collection-request-schema';
import { generateSlugLocalizedString } from '../../lib/utils/slug-utils';
import { Connection } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name)
    private collectionModel: Model<CollectionDocument>,
    @InjectModel(CollectionVideo.name)
    private collectionVideoModel: Model<CollectionVideoDocument>,
    @InjectModel(Season.name)
    private seasonModel: Model<SeasonDocument>,
    @InjectConnection()
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
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
  ): Promise<CollectionDocument | null> {
    return this.collectionModel.findOne({ 'title.en-US': title });
  }

  async findCollectionsByTitle(
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

  async createCollection(
    body: CreateCollectionRequest,
  ): Promise<CollectionDocument> {
    const existingCollection = await this.collectionModel.findOne({
      'title.en-US': body.title['en-US'],
    });

    if (existingCollection) {
      throw new ConflictException('Collection title already exists');
    }

    const collection = await this.collectionModel.create({
      ...body,
      slug: generateSlugLocalizedString(body.title),
    });

    this.eventEmitter.emit('collection.created', {
      collectionId: collection._id.toString(),
    });
    return collection;
  }

  async updateCollection(
    id: string,
    body: Partial<Collection>,
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

  async getSeason(
    collectionId: string,
    seasonNumber: number,
  ): Promise<SeasonDocument | null> {
    return this.seasonModel.findOne({ collectionId, seasonNumber });
  }

  async createSeason(
    collectionId: string,
    seasonNumber: number,
  ): Promise<SeasonDocument | null> {
    return await this.seasonModel.create({
      collectionId,
      seasonNumber,
    });
  }

  async addVideoToCollection(
    collectionId: string,
    videoId: string,
    episodeNumber: number,
    seasonId?: string,
  ) {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        // Insert the new episode link
        await this.collectionVideoModel.create(
          [
            {
              collectionId,
              seasonId,
              videoId,
              episodeNumber,
            },
          ],
          { session },
        );

        // Increment videoCount in Collection
        await this.collectionModel.updateOne(
          { _id: collectionId },
          { $inc: { videoCount: 1 } },
          { session },
        );

        // Increment videoCount in Season
        await this.seasonModel.updateOne(
          { _id: seasonId },
          { $inc: { videoCount: 1 } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }
}

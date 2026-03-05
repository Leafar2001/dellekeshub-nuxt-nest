import { ConflictException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  CollectionEntity,
  CollectionDocument,
  CollectionVideoEntity,
  CollectionVideoDocument,
  SeasonEntity,
  SeasonDocument,
  CollectionVideo,
  Season,
  Collection,
} from '../persistence/collection.schema';
import { Model, Types } from 'mongoose';
import { Pagination } from '../../lib/validation/pagination';
import { queryResultToPagination } from '../../lib/utils/pagination-utils';
import { CreateCollectionRequest } from '../validation/create-collection-request-schema';
import { generateSlugLocalizedString } from '../../lib/utils/slug-utils';
import { Connection } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { toDomain, toDomainLean } from '../../lib/utils/mongodb-utils';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(CollectionEntity.name)
    private collectionModel: Model<CollectionDocument>,
    @InjectModel(CollectionVideoEntity.name)
    private collectionVideoModel: Model<CollectionVideoDocument>,
    @InjectModel(SeasonEntity.name)
    private seasonModel: Model<SeasonDocument>,
    @InjectConnection()
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    limit: number = 20,
    pagination?: Pagination,
  ): Promise<{
    collections: Collection[];
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
      .lean();

    return {
      collections: queryResult
        .map((collectionDocument) => toDomainLean(collectionDocument))
        .filter((collection) => collection !== undefined),
      pagination: queryResultToPagination(queryResult),
    };
  }

  async findCollectionById(id: string): Promise<Collection | undefined> {
    const collectionDocument = await this.collectionModel.findById(id).lean();

    return toDomainLean(collectionDocument);
  }

  async findCollectionByTitle(title: string): Promise<Collection | undefined> {
    const collectionDocument = await this.collectionModel
      .findOne({
        'title.en-US': title,
      })
      .lean();

    return toDomainLean(collectionDocument);
  }

  async findCollectionsByTitle(
    title: string,
    limit: number = 20,
    pagination?: Pagination,
  ): Promise<{
    collections: Collection[];
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
      .lean();

    return {
      collections: queryResult
        .map((collectionDocument) => toDomainLean(collectionDocument))
        .filter((collection) => collection !== undefined),
      pagination: queryResultToPagination(queryResult),
    };
  }

  async createCollection(body: CreateCollectionRequest): Promise<Collection> {
    const existingCollection = await this.collectionModel.findOne({
      'title.en-US': body.title['en-US'],
    });

    if (existingCollection) {
      throw new ConflictException('Collection title already exists');
    }

    const collectionDocument = await this.collectionModel.create({
      ...body,
      slug: generateSlugLocalizedString(body.title),
    });

    this.eventEmitter.emit('collection.created', {
      collectionId: collectionDocument._id.toString(),
    });

    return toDomain(collectionDocument) as Collection;
  }

  reindexCollection(collectionId: string) {
    this.eventEmitter.emit('collection.reindex', {
      collectionId,
    });
  }

  async updateCollection(
    id: string,
    body: Partial<CollectionEntity>,
  ): Promise<Collection | undefined> {
    const collection = await this.collectionModel
      .findByIdAndUpdate(
        id,
        {
          ...body,
          slug: body.title
            ? generateSlugLocalizedString(body.title)
            : undefined,
        },
        { new: true },
      )
      .lean();

    return toDomainLean(collection);
  }

  async deleteCollection(id: string): Promise<CollectionDocument | null> {
    return this.collectionModel.findByIdAndDelete(id);
  }

  async getSeason(
    collectionId: string,
    seasonNumber: number,
  ): Promise<Season | undefined> {
    const seasonDocument = await this.seasonModel.findOne({
      collectionId,
      seasonNumber,
    });

    return toDomain(seasonDocument);
  }

  async createSeason(
    collectionId: string,
    seasonNumber: number,
  ): Promise<Season | undefined> {
    const seasonDocument = await this.seasonModel.create({
      collectionId,
      seasonNumber,
    });

    return toDomain(seasonDocument);
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

  async removeVideoFromCollection(
    collectionId: string,
    videoId: string,
    episodeNumber: number,
    seasonId?: string,
  ) {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        // Remove the episode
        await this.collectionVideoModel.deleteOne(
          {
            collectionId,
            seasonId,
            videoId,
            episodeNumber,
          },
          { session },
        );

        // Decrement videoCount in Collection
        await this.collectionModel.updateOne(
          { _id: collectionId },
          { $inc: { videoCount: -1 } },
          { session },
        );

        // Decrement videoCount in Season
        await this.seasonModel.updateOne(
          { _id: seasonId },
          { $inc: { videoCount: -1 } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }

  async getAllCollectionVideosByCollectionId(collectionId: string): Promise<
    (Omit<CollectionVideo, 'videoId'> & { videoId: string | undefined } & {
      path: string | undefined;
    })[]
  > {
    const result = await this.collectionVideoModel
      .find({ collectionId })
      .populate<{
        videoId: { _id: Types.ObjectId; path: string };
      }>('videoId', 'path')
      .exec();

    return result.map((item) => ({
      ...item,
      id: item._id.toString(),
      videoId: item.videoId?._id?.toString(),
      collectionId: item.collectionId.toString(),
      seasonId: item.seasonId?.toString(),
      path: item.videoId?.path,
    }));
  }
}

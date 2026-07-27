import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../persistence/collection.entity';
import { CollectionImage } from '../persistence/entities/collection-image.entity';
import { CollectionVideo } from '../persistence/entities/collection-video.entity';
import { CollectionSeason } from '../persistence/entities/collection-season.entity';
import { Pagination } from '../../lib/validation/pagination';
import { queryResultToPagination } from '../../lib/utils/pagination-utils';
import { type CreateCollectionRequest } from '../validation/create-collection-request-schema';
import { generateSlugLocalizedString } from '../../lib/utils/slug-utils';
import type { LocalizedString } from '../../lib/validation/localization';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionImage)
    private readonly collectionImageRepository: Repository<CollectionImage>,
    @InjectRepository(CollectionVideo)
    private readonly collectionVideoRepository: Repository<CollectionVideo>,
    @InjectRepository(CollectionSeason)
    private readonly collectionSeasonRepository: Repository<CollectionSeason>,
  ) {}

  private static applyCursor(
    qb: ReturnType<Repository<Collection>['createQueryBuilder']>,
    pagination: Pagination | undefined,
  ) {
    if (!pagination) return;
    qb.andWhere(
      '(collection."createdAt" < :cursorCreatedAt OR (collection."createdAt" = :cursorCreatedAt AND collection.id < :cursorId))',
      {
        cursorCreatedAt: pagination.createdAt,
        cursorId: pagination.lastId,
      },
    );
  }

  async findAll(limit: number = 20, pagination?: Pagination) {
    const qb = this.collectionRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.images', 'images')
      .leftJoinAndSelect('collection.videos', 'videos')
      .leftJoinAndSelect('collection.seasons', 'seasons')
      .leftJoinAndSelect('seasons.episodes', 'episodes')
      .leftJoinAndSelect('videos.video', 'video')
      .leftJoinAndSelect('episodes.video', 'episodeVideo')
      .leftJoinAndSelect('images.image', 'image')
      .orderBy('collection.createdAt', 'DESC')
      .addOrderBy('collection.id', 'DESC')
      .take(limit);

    CollectionService.applyCursor(qb, pagination);

    const collections = await qb.getMany();

    return {
      collections,
      pagination: queryResultToPagination(collections),
    };
  }

  findCollectionById(id: string) {
    return this.collectionRepository.findOne({
      where: { id },
      relations: {
        images: { image: true },
        videos: { video: { images: { image: true } } },
        seasons: { episodes: { video: { images: { image: true } } } },
      },
    });
  }

  async findCollectionByTitle(title: string) {
    return this.collectionRepository
      .createQueryBuilder('collection')
      .where("collection.title ->> 'en-US' = :title", { title })
      .getOne();
  }

  async findCollectionsByTitle(
    title: string,
    limit: number = 20,
    pagination?: Pagination,
  ) {
    const fuzzyPattern =
      title
        .split('')
        .map((c) => c.replace(/[%_]/g, '\\$&'))
        .join('%') + '%';

    const qb = this.collectionRepository
      .createQueryBuilder('collection')
      .where("collection.title ->> 'en-US' ILIKE :pattern ESCAPE '\\'", {
        pattern: fuzzyPattern,
      })
      .orderBy('collection.createdAt', 'DESC')
      .addOrderBy('collection.id', 'DESC')
      .take(limit);

    CollectionService.applyCursor(qb, pagination);

    const collections = await qb.getMany();

    return {
      collections,
      pagination: queryResultToPagination(collections),
    };
  }

  private async assertTitleAvailable(title: LocalizedString) {
    const existing = await this.collectionRepository
      .createQueryBuilder('collection')
      .where("collection.title ->> 'en-US' = :title", {
        title: title['en-US'],
      })
      .getOne();

    if (existing) {
      throw new ConflictException('Collection title already exists');
    }
  }

  async createCollection(body: CreateCollectionRequest): Promise<Collection> {
    await this.assertTitleAvailable(body.title);

    const collection = this.collectionRepository.create({
      title: body.title,
      description: body.description ?? null,
      trailer: body.trailer ?? null,
      type: body.type,
      slug: generateSlugLocalizedString(body.title) ?? {},
    });

    return this.collectionRepository.save(collection);
  }

  private async replaceContents(
    collectionId: string,
    payload: {
      type?: Collection['type'];
      videos?: Array<{ videoId: string; episodeNumber: number }>;
      seasons?: Array<{
        seasonNumber: number;
        episodes: Array<{ videoId: string; episodeNumber: number }>;
      }>;
    },
  ) {
    await this.collectionSeasonRepository.delete({ collectionId });
    await this.collectionVideoRepository.delete({ collectionId });

    if (payload.type) {
      await this.collectionRepository.update(collectionId, {
        type: payload.type,
      });
    }

    if (payload.videos && payload.videos.length > 0) {
      await this.collectionVideoRepository.save(
        payload.videos.map((v) =>
          this.collectionVideoRepository.create({
            collectionId,
            seasonId: null,
            videoId: v.videoId,
            episodeNumber: v.episodeNumber,
          }),
        ),
      );
    }

    if (payload.seasons && payload.seasons.length > 0) {
      for (const season of payload.seasons) {
        const createdSeason = this.collectionSeasonRepository.create({
          collectionId,
          seasonNumber: season.seasonNumber,
        });
        const savedSeason =
          await this.collectionSeasonRepository.save(createdSeason);

        if (season.episodes && season.episodes.length > 0) {
          await this.collectionVideoRepository.save(
            season.episodes.map((e) =>
              this.collectionVideoRepository.create({
                collectionId,
                seasonId: savedSeason.id,
                videoId: e.videoId,
                episodeNumber: e.episodeNumber,
              }),
            ),
          );
        }
      }
    }
  }

  async updateCollection(
    id: string,
    body: Partial<{
      title: LocalizedString;
      description: LocalizedString | null;
      trailer: LocalizedString | null;
      type: Collection['type'];
      videos: Array<{ videoId: string; episodeNumber: number }>;
      seasons: Array<{
        seasonNumber: number;
        episodes: Array<{ videoId: string; episodeNumber: number }>;
      }>;
    }>,
  ): Promise<Collection | null> {
    await this.replaceContents(id, {
      type: body.type,
      videos: body.videos,
      seasons: body.seasons,
    });

    if (body.title) {
      await this.collectionRepository.update(id, {
        title: body.title,
        slug: generateSlugLocalizedString(body.title) ?? undefined,
        ...(body.description !== undefined
          ? { description: body.description }
          : {}),
        ...(body.trailer !== undefined ? { trailer: body.trailer } : {}),
      });
    } else {
      const patch: Record<string, unknown> = {};
      if (body.description !== undefined) patch.description = body.description;
      if (body.trailer !== undefined) patch.trailer = body.trailer;
      if (Object.keys(patch).length > 0) {
        await this.collectionRepository.update(id, patch);
      }
    }

    return this.findCollectionById(id);
  }

  async deleteCollection(id: string) {
    await this.collectionRepository.delete(id);
    return { success: true };
  }
}

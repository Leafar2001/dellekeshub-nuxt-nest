import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Collection } from '../persistence/collection.entity';
import { CollectionImage } from '../persistence/entities/collection-image.entity';
import { CollectionVideo } from '../persistence/entities/collection-video.entity';
import { CollectionSeason } from '../persistence/entities/collection-season.entity';
import { WatchProgress } from '../../watch-progress/persistence/watch-progress.entity';
import { Review } from '../../reviews/persistence/review.entity';
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
    @InjectRepository(WatchProgress)
    private readonly watchProgressRepository: Repository<WatchProgress>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
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

  async findAll(limit: number = 20, pagination?: Pagination, genre?: string) {
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

    if (genre) {
      qb.andWhere(':genre = ANY(collection.genres)', { genre });
    }

    CollectionService.applyCursor(qb, pagination);

    const collections = await qb.getMany();

    return {
      collections,
      pagination: queryResultToPagination(collections),
    };
  }

  async findAllGenres(): Promise<string[]> {
    const rows = await this.collectionRepository
      .createQueryBuilder('collection')
      .select('DISTINCT unnest(collection.genres)', 'genre')
      .orderBy('genre', 'ASC')
      .getRawMany<{ genre: string }>();

    return rows.map((row) => row.genre);
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

  private async findCollectionsByIds(ids: string[]) {
    if (ids.length === 0) return new Map<string, Collection>();

    const collections = await this.collectionRepository.find({
      where: { id: In(ids) },
      relations: { images: { image: true } },
    });

    return new Map(collections.map((c) => [c.id, c]));
  }

  async findContinueWatching(userId: string, limit: number = 20) {
    const progressRows = await this.watchProgressRepository.find({
      where: { userId, finished: false },
      order: { updatedAt: 'DESC' },
      take: limit,
    });

    if (progressRows.length === 0) return [];

    const byId = await this.findCollectionsByIds(
      progressRows.map((p) => p.mediaId),
    );

    return progressRows
      .filter((p) => byId.has(p.mediaId))
      .map((p) => ({
        collection: byId.get(p.mediaId)!,
        episodeId: p.episodeId,
        currentTime: p.currentTime,
        duration: p.duration,
        percentage:
          p.duration && p.duration > 0
            ? Math.min(100, Math.round((p.currentTime / p.duration) * 100))
            : 0,
        updatedAt: p.updatedAt,
      }));
  }

  async findTrending(limit: number = 20) {
    const rows = await this.watchProgressRepository
      .createQueryBuilder('progress')
      .select('progress."mediaId"', 'mediaId')
      .addSelect('COUNT(DISTINCT progress."userId")', 'viewers')
      .addSelect('MAX(progress."updatedAt")', 'lastWatched')
      .groupBy('progress."mediaId"')
      .orderBy('viewers', 'DESC')
      .addOrderBy('"lastWatched"', 'DESC')
      .limit(limit)
      .getRawMany<{ mediaId: string; viewers: string }>();

    if (rows.length === 0) return [];

    const byId = await this.findCollectionsByIds(rows.map((r) => r.mediaId));

    return rows
      .filter((r) => byId.has(r.mediaId))
      .map((r) => ({
        collection: byId.get(r.mediaId)!,
        viewers: parseInt(r.viewers, 10),
      }));
  }

  async findTopRated(limit: number = 20) {
    const rows = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review."mediaId"', 'mediaId')
      .addSelect('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review."mediaType" = :mediaType', { mediaType: 'collection' })
      .groupBy('review."mediaId"')
      .orderBy('average', 'DESC')
      .addOrderBy('"reviewCount"', 'DESC')
      .limit(limit)
      .getRawMany<{ mediaId: string; average: string; reviewCount: string }>();

    if (rows.length === 0) return [];

    const byId = await this.findCollectionsByIds(rows.map((r) => r.mediaId));

    return rows
      .filter((r) => byId.has(r.mediaId))
      .map((r) => ({
        collection: byId.get(r.mediaId)!,
        averageRating: r.average ? parseFloat(r.average) : 0,
        reviewCount: r.reviewCount ? parseInt(r.reviewCount, 10) : 0,
      }));
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
      genres: body.genres ?? [],
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
      genres: string[];
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
        ...(body.genres !== undefined ? { genres: body.genres } : {}),
      });
    } else {
      const patch: Record<string, unknown> = {};
      if (body.description !== undefined) patch.description = body.description;
      if (body.trailer !== undefined) patch.trailer = body.trailer;
      if (body.genres !== undefined) patch.genres = body.genres;
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

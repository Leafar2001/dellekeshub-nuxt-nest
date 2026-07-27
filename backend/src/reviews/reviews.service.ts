import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './persistence/review.entity';
import { Collection } from '../collections/persistence/collection.entity';
import { Video } from '../videos/persistence/video.entity';
import { type MediaType } from '../lib/project';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  private async assertMediaExists(mediaId: string, mediaType: MediaType) {
    const repository =
      mediaType === 'collection'
        ? this.collectionRepository
        : this.videoRepository;

    const exists = await repository.exists({ where: { id: mediaId } });

    if (!exists) {
      throw new NotFoundException(`${mediaType} not found`);
    }
  }

  async create(
    userId: string,
    mediaId: string,
    mediaType: MediaType,
    data: { rating: number; comment?: string },
  ) {
    await this.assertMediaExists(mediaId, mediaType);

    const existing = await this.reviewRepository.findOne({
      where: { userId, mediaId, mediaType },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this media');
    }

    const review = this.reviewRepository.create({
      userId,
      mediaId,
      mediaType,
      rating: data.rating,
      comment: data.comment ?? null,
    });
    return this.reviewRepository.save(review);
  }

  findForMedia(mediaId: string) {
    return this.reviewRepository.find({
      where: { mediaId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getSummary(mediaId: string, userId: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.mediaId = :mediaId', { mediaId })
      .getRawOne<{ avg: string | null; count: string }>();

    const myReview = await this.reviewRepository.findOne({
      where: { mediaId, userId },
      relations: { user: true },
    });

    return {
      average: result?.avg ? parseFloat(result.avg) : 0,
      count: result?.count ? parseInt(result.count, 10) : 0,
      myReview: myReview ?? null,
    };
  }

  async getAverageRating(mediaId: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.mediaId = :mediaId', { mediaId })
      .getRawOne<{ avg: string | null }>();

    return result?.avg ? parseFloat(result.avg) : 0;
  }
}

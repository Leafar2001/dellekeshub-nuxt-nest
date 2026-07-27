import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './persistence/review.entity';
import { type MediaType } from '../lib/project';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  create(
    userId: string,
    mediaId: string,
    mediaType: MediaType,
    data: { rating: number; comment?: string },
  ) {
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

  async getAverageRating(mediaId: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.mediaId = :mediaId', { mediaId })
      .getRawOne<{ avg: string | null }>();

    return result?.avg ? parseFloat(result.avg) : 0;
  }
}

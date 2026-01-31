import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(userId: string, mediaId: string, validator: { rating: number; comment?: string }) {
    return this.reviewModel.create({
      userId,
      mediaId,
      ...validator,
    });
  }

  findForMedia(mediaId: string) {
    return this.reviewModel
      .find({ mediaId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
  }

  async getAverageRating(mediaId: string) {
    const result = await this.reviewModel.aggregate([
      { $match: { mediaId: new Types.ObjectId(mediaId) } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    return result[0]?.avg ?? 0;
  }
}

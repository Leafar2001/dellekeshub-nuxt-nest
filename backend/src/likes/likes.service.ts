import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Like, LikeDocument } from './persistence/like.schema';

interface LikeCountResult {
  _id: Types.ObjectId;
  count: number;
}

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);

  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}

  async like(
    userId: string,
    mediaId: string,
  ): Promise<{ liked: boolean; count: number }> {
    const existing = await this.likeModel.findOne({
      userId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(mediaId),
    });

    if (existing) {
      return { liked: true, count: await this.count(mediaId) };
    }

    await this.likeModel.create({
      userId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(mediaId),
    });

    this.logger.log(`User ${userId} liked media ${mediaId}`);
    return { liked: true, count: await this.count(mediaId) };
  }

  async unlike(
    userId: string,
    mediaId: string,
  ): Promise<{ liked: boolean; count: number }> {
    const result = await this.likeModel.deleteOne({
      userId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(mediaId),
    });

    if (result.deletedCount > 0) {
      this.logger.log(`User ${userId} unliked media ${mediaId}`);
    }

    return { liked: false, count: await this.count(mediaId) };
  }

  async count(mediaId: string): Promise<number> {
    return this.likeModel.countDocuments({
      mediaId: new Types.ObjectId(mediaId),
    });
  }

  async isLiked(userId: string, mediaId: string): Promise<boolean> {
    const like = await this.likeModel.findOne({
      userId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(mediaId),
    });
    return !!like;
  }

  async getLikeStatus(
    userId: string,
    mediaId: string,
  ): Promise<{ liked: boolean; count: number }> {
    const liked = await this.isLiked(userId, mediaId);
    const count = await this.count(mediaId);
    return { liked, count };
  }

  async getUserLikes(userId: string): Promise<Types.ObjectId[]> {
    const likes = await this.likeModel.find({
      userId: new Types.ObjectId(userId),
    });
    return likes.map((l) => l.mediaId);
  }

  async getLikesCountByMediaIds(
    mediaIds: string[],
  ): Promise<Map<string, number>> {
    const counts = await this.likeModel.aggregate([
      {
        $match: {
          mediaId: { $in: mediaIds.map((id) => new Types.ObjectId(id)) },
        },
      },
      { $group: { _id: '$mediaId', count: { $sum: 1 } } },
    ]);
    const map = new Map<string, number>();
    counts.forEach((c) => map.set(c._id.toString(), c.count));
    return map;
  }
}

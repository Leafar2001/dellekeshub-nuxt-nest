import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Watchlist, WatchlistDocument } from './persistence/watchlist.schema';

@Injectable()
export class WatchlistService {
  private readonly logger = new Logger(WatchlistService.name);

  constructor(
    @InjectModel(Watchlist.name)
    private watchlistModel: Model<WatchlistDocument>,
  ) {}

  async add(
    userId: string,
    mediaId: string,
  ): Promise<{ inWatchlist: boolean }> {
    const existing = await this.watchlistModel.findOne({
      userId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(mediaId),
    });

    if (existing) {
      return { inWatchlist: true };
    }

    await this.watchlistModel.create({
      userId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(mediaId),
    });

    this.logger.log(`User ${userId} added media ${mediaId} to watchlist`);
    return { inWatchlist: true };
  }

  async remove(
    userId: string,
    mediaId: string,
  ): Promise<{ inWatchlist: boolean }> {
    await this.watchlistModel.deleteOne({
      userId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(mediaId),
    });

    this.logger.log(`User ${userId} removed media ${mediaId} from watchlist`);
    return { inWatchlist: false };
  }

  async isInWatchlist(userId: string, mediaId: string): Promise<boolean> {
    const item = await this.watchlistModel.findOne({
      userId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(mediaId),
    });
    return !!item;
  }

  async getWatchlistStatus(
    userId: string,
    mediaId: string,
  ): Promise<{ inWatchlist: boolean }> {
    return { inWatchlist: await this.isInWatchlist(userId, mediaId) };
  }

  async getUserWatchlist(userId: string): Promise<Types.ObjectId[]> {
    const items = await this.watchlistModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ addedAt: -1 });
    return items.map((i) => i.mediaId);
  }

  async getWatchlistWithDetails(userId: string): Promise<WatchlistDocument[]> {
    return this.watchlistModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ addedAt: -1 })
      .exec();
  }

  async isInWatchlistByIds(
    userId: string,
    mediaIds: string[],
  ): Promise<Map<string, boolean>> {
    const items = await this.watchlistModel.find({
      userId: new Types.ObjectId(userId),
      mediaId: { $in: mediaIds.map((id) => new Types.ObjectId(id)) },
    });
    const map = new Map<string, boolean>();
    items.forEach((i) => map.set(i.mediaId.toString(), true));
    return map;
  }
}

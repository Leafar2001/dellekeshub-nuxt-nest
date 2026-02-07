import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  WatchProgress,
  WatchProgressDocument,
} from './persistence/watch-progress.schema';
import { Model } from 'mongoose';

@Injectable()
export class WatchProgressService {
  constructor(
    @InjectModel(WatchProgress.name)
    private model: Model<WatchProgressDocument>,
  ) {}

  upsert(
    userId: string,
    mediaId: string,
    episodeId: string,
    currentTime: number,
    duration: number,
  ) {
    return this.model.findOneAndUpdate(
      { userId, mediaId },
      {
        userId,
        mediaId,
        episodeId,
        currentTime,
        duration,
        finished: duration && currentTime >= duration - 5,
      },
      { upsert: true, new: true },
    );
  }

  get(userId: string, mediaId: string) {
    return this.model.findOne({ userId, mediaId });
  }

  history(userId: string) {
    return this.model
      .find({ userId })
      .populate('mediaId')
      .sort({ updatedAt: -1 });
  }
}

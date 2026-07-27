import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchProgress } from './persistence/watch-progress.entity';
import { type MediaType } from '../lib/project';

@Injectable()
export class WatchProgressService {
  constructor(
    @InjectRepository(WatchProgress)
    private readonly watchProgressRepository: Repository<WatchProgress>,
  ) {}

  async upsert(
    userId: string,
    mediaId: string,
    mediaType: MediaType,
    episodeId: string,
    currentTime: number,
    duration: number,
  ) {
    const existing = await this.watchProgressRepository.findOne({
      where: { userId, mediaId },
    });

    const finished = duration > 0 && currentTime >= duration - 5;

    if (existing) {
      await this.watchProgressRepository.update(existing.id, {
        episodeId,
        currentTime,
        duration,
        finished,
      });
      return this.watchProgressRepository.findOne({
        where: { id: existing.id },
      });
    }

    const created = this.watchProgressRepository.create({
      userId,
      mediaId,
      mediaType,
      episodeId,
      currentTime,
      duration,
      finished,
    });
    return this.watchProgressRepository.save(created);
  }

  get(userId: string, mediaId: string) {
    return this.watchProgressRepository.findOne({
      where: { userId, mediaId },
    });
  }

  history(userId: string) {
    return this.watchProgressRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }
}

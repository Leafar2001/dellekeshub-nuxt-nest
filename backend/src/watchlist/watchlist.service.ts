import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchlistItem } from './persistence/watchlist-item.entity';
import { Collection } from '../collections/persistence/collection.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(WatchlistItem)
    private readonly watchlistRepository: Repository<WatchlistItem>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
  ) {}

  async getWatchlist(userId: string) {
    const items = await this.watchlistRepository.find({
      where: { userId },
      relations: { collection: { images: { image: true } } },
      order: { addedAt: 'DESC' },
    });

    return {
      collections: items.map((item) => item.collection),
    };
  }

  async add(userId: string, collectionId: string) {
    const exists = await this.collectionRepository.exists({
      where: { id: collectionId },
    });

    if (!exists) {
      throw new NotFoundException('Collection not found');
    }

    await this.watchlistRepository
      .createQueryBuilder()
      .insert()
      .into(WatchlistItem)
      .values({ userId, collectionId })
      .orIgnore()
      .execute();

    return { success: true };
  }

  async remove(userId: string, collectionId: string) {
    await this.watchlistRepository.delete({ userId, collectionId });
    return { success: true };
  }

  async isInWatchlist(userId: string, collectionId: string) {
    return this.watchlistRepository.exists({ where: { userId, collectionId } });
  }
}

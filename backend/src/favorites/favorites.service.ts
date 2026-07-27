import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteItem } from './persistence/favorite-item.entity';
import { Collection } from '../collections/persistence/collection.entity';
import { User } from '../users/persistence/user.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteItem)
    private readonly favoritesRepository: Repository<FavoriteItem>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getFavorites(userId: string) {
    const items = await this.favoritesRepository.find({
      where: { userId },
      relations: { collection: { images: { image: true } } },
      order: { addedAt: 'DESC' },
    });

    return {
      collections: items.map((item) => item.collection),
    };
  }

  async getFavoritesByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.getFavorites(user.id);
  }

  async add(userId: string, collectionId: string) {
    const exists = await this.collectionRepository.exists({
      where: { id: collectionId },
    });

    if (!exists) {
      throw new NotFoundException('Collection not found');
    }

    await this.favoritesRepository
      .createQueryBuilder()
      .insert()
      .into(FavoriteItem)
      .values({ userId, collectionId })
      .orIgnore()
      .execute();

    return { success: true };
  }

  async remove(userId: string, collectionId: string) {
    await this.favoritesRepository.delete({ userId, collectionId });
    return { success: true };
  }

  async isFavorite(userId: string, collectionId: string) {
    return this.favoritesRepository.exists({ where: { userId, collectionId } });
  }
}

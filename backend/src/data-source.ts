import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './users/persistence/user.entity';
import { Image } from './images/persistence/image.entity';
import { Person } from './person/persistence/person.entity';
import { Video } from './videos/persistence/video.entity';
import { VideoImage } from './videos/persistence/entities/video-image.entity';
import { VideoSubtitle } from './videos/persistence/entities/video-subtitle.entity';
import { VideoPerson } from './videos/persistence/entities/video-person.entity';
import { Collection } from './collections/persistence/collection.entity';
import { CollectionImage } from './collections/persistence/entities/collection-image.entity';
import { CollectionVideo } from './collections/persistence/entities/collection-video.entity';
import { CollectionSeason } from './collections/persistence/entities/collection-season.entity';
import { Review } from './reviews/persistence/review.entity';
import { WatchProgress } from './watch-progress/persistence/watch-progress.entity';

dotenv.config();

export const entities = [
  User,
  Image,
  Person,
  Video,
  VideoImage,
  VideoSubtitle,
  VideoPerson,
  Collection,
  CollectionImage,
  CollectionVideo,
  CollectionSeason,
  Review,
  WatchProgress,
];

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  synchronize: process.env.NODE_ENV !== 'prod',
  logging: process.env.NODE_ENV !== 'prod',
});

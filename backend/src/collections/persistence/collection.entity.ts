import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { type CollectionType, collectionTypes } from '../../lib/project';
import type { LocalizedString } from '../../lib/validation/localization';
import { CollectionImage } from './entities/collection-image.entity';
import { CollectionVideo } from './entities/collection-video.entity';
import { CollectionSeason } from './entities/collection-season.entity';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  title: LocalizedString;

  @Column({ type: 'jsonb' })
  slug: LocalizedString;

  @Column({ type: 'jsonb', nullable: true })
  description: LocalizedString | null;

  @Column({
    type: 'enum',
    enum: collectionTypes as unknown as string[],
    default: 'movie',
  })
  type: CollectionType;

  @Column({ type: 'text', array: true, default: () => `'{}'` })
  genres: string[];

  @Column({ type: 'jsonb', nullable: true })
  trailer: LocalizedString | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(
    () => CollectionImage,
    (collectionImage) => collectionImage.collection,
    {
      eager: false,
    },
  )
  images: CollectionImage[];

  @OneToMany(
    () => CollectionVideo,
    (collectionVideo) => collectionVideo.collection,
    {
      eager: false,
    },
  )
  videos: CollectionVideo[];

  @OneToMany(
    () => CollectionSeason,
    (collectionSeason) => collectionSeason.collection,
    {
      eager: false,
    },
  )
  seasons: CollectionSeason[];
}

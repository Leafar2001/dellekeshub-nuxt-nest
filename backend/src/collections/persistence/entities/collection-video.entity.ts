import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Collection } from '../collection.entity';
import { CollectionSeason } from './collection-season.entity';
import { Video } from '../../../videos/persistence/video.entity';

@Entity('collection_videos')
export class CollectionVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Collection, (collection) => collection.videos, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection | null;

  @Column({ type: 'uuid', nullable: true })
  collectionId: string | null;

  @ManyToOne(() => CollectionSeason, (season) => season.episodes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'season_id' })
  season: CollectionSeason | null;

  @Column({ type: 'uuid', nullable: true })
  seasonId: string | null;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'integer' })
  episodeNumber: number;

  @CreateDateColumn({ type: 'timestamptz' })
  addedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Collection } from '../collection.entity';
import { CollectionVideo } from './collection-video.entity';

@Entity('collection_seasons')
export class CollectionSeason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Collection, (collection) => collection.seasons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @Column({ type: 'uuid' })
  collectionId: string;

  @Column({ type: 'integer' })
  seasonNumber: number;

  @OneToMany(() => CollectionVideo, (episode) => episode.season, {
    eager: false,
  })
  episodes: CollectionVideo[];
}

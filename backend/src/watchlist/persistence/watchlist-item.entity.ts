import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/persistence/user.entity';
import { Collection } from '../../collections/persistence/collection.entity';

@Entity('watchlist_items')
@Index('idx_watchlist_user_collection', ['userId', 'collectionId'], {
  unique: true,
})
export class WatchlistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Collection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @Column({ type: 'uuid' })
  collectionId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  addedAt: Date;
}

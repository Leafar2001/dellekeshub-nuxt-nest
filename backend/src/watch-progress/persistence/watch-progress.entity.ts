import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/persistence/user.entity';
import { type MediaType, mediaTypes } from '../../lib/project';

@Entity('watch_progress')
@Index('idx_watch_progress_user_media', ['userId', 'mediaId'], {
  unique: true,
})
export class WatchProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.watchProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  mediaId: string;

  @Column({
    type: 'enum',
    enum: mediaTypes as unknown as string[],
  })
  mediaType: MediaType;

  @Column({ type: 'uuid', nullable: true })
  episodeId: string | null;

  @Column({ type: 'double precision', default: 0 })
  currentTime: number;

  @Column({ type: 'double precision', nullable: true })
  duration: number | null;

  @Column({ type: 'boolean', default: false })
  finished: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

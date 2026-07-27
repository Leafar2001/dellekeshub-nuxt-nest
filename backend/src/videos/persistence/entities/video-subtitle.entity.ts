import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Video } from '../video.entity';

@Entity('video_subtitles')
export class VideoSubtitle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Video, (video) => video.subtitles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @Column({ type: 'uuid' })
  videoId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  language: string;

  @Column({ type: 'varchar' })
  path: string;

  @CreateDateColumn({ type: 'timestamptz' })
  addedAt: Date;
}

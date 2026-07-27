import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import type { LocalizedString } from '../../lib/validation/localization';
import { VideoImage } from './entities/video-image.entity';
import { VideoSubtitle } from './entities/video-subtitle.entity';
import { VideoPerson } from './entities/video-person.entity';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  slug: LocalizedString;

  @Column({ type: 'jsonb' })
  title: LocalizedString;

  @Column({ type: 'jsonb', nullable: true })
  description: LocalizedString | null;

  @Column({ type: 'text', array: true, default: () => `'{}'` })
  genres: string[];

  @Column({ type: 'varchar' })
  path: string;

  @Column({ type: 'timestamptz', nullable: true })
  releaseDate: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  trailer: LocalizedString | null;

  @Column({ type: 'integer', nullable: true })
  duration: number | null;

  @Column({ type: 'double precision', nullable: true })
  introStart: number | null;

  @Column({ type: 'double precision', nullable: true })
  introEnd: number | null;

  @Column({ type: 'double precision', nullable: true })
  outroStart: number | null;

  @Column({ type: 'double precision', nullable: true })
  outroEnd: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => VideoImage, (videoImage) => videoImage.video, {
    eager: false,
  })
  images: VideoImage[];

  @OneToMany(() => VideoSubtitle, (videoSubtitle) => videoSubtitle.video, {
    eager: false,
  })
  subtitles: VideoSubtitle[];

  @OneToMany(() => VideoPerson, (videoPerson) => videoPerson.video, {
    eager: false,
  })
  persons: VideoPerson[];
}

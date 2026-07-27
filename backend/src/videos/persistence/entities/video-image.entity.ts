import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { type ImageType, imageTypes } from '../../../lib/project';
import { Video } from '../video.entity';
import { Image } from '../../../images/persistence/image.entity';

@Entity('video_images')
export class VideoImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Video, (video) => video.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @Column({ type: 'uuid' })
  videoId: string;

  @ManyToOne(() => Image, (image) => image.videoImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'image_id' })
  image: Image;

  @Column({ type: 'uuid' })
  imageId: string;

  @Column({
    type: 'enum',
    enum: imageTypes as unknown as string[],
  })
  type: ImageType;

  @CreateDateColumn({ type: 'timestamptz' })
  addedAt: Date;
}

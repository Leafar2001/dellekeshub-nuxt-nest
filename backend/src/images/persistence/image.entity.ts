import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { type ImageType } from '../../lib/project';
import { VideoImage } from '../../videos/persistence/entities/video-image.entity';
import { CollectionImage } from '../../collections/persistence/entities/collection-image.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  path: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  slug: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => VideoImage, (videoImage) => videoImage.image)
  videoImages: VideoImage[];

  @OneToMany(() => CollectionImage, (collectionImage) => collectionImage.image)
  collectionImages: CollectionImage[];
}

export type { ImageType };

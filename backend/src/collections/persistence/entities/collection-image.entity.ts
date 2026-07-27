import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { type ImageType, imageTypes } from '../../../lib/project';
import { Collection } from '../collection.entity';
import { Image } from '../../../images/persistence/image.entity';

@Entity('collection_images')
export class CollectionImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Collection, (collection) => collection.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @Column({ type: 'uuid' })
  collectionId: string;

  @ManyToOne(() => Image, (image) => image.collectionImages, {
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

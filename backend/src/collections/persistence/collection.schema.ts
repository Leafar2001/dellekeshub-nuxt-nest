import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  type ImageType,
  imageTypes,
  collectionTypes,
  type CollectionType,
} from 'src/lib/project';
import type { LocalizedString } from '../../lib/validation/localization';

export type CollectionDocument = Collection & Document;

@Schema({ _id: false })
class CollectionImage {
  @Prop({ type: Types.ObjectId, ref: 'Image', required: true })
  imageId: Types.ObjectId;

  @Prop({ type: [String], enum: imageTypes, required: true })
  type: ImageType;

  @Prop({ default: () => new Date() })
  addedAt: Date;
}

const CollectionImageSchema = SchemaFactory.createForClass(CollectionImage);

@Schema({ _id: false })
export class CollectionVideo {
  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  videoId: Types.ObjectId;

  @Prop({ required: true })
  episodeNumber: number;

  @Prop({ default: () => new Date() })
  addedAt: Date;
}

const CollectionVideoSchema = SchemaFactory.createForClass(CollectionVideo);

@Schema({ _id: false })
export class Season {
  @Prop({ type: [CollectionVideoSchema], default: [] })
  episodes: CollectionVideo[];

  @Prop({ required: true })
  seasonNumber: number;
}

const SeasonSchema = SchemaFactory.createForClass(Season);

@Schema({ timestamps: true })
export class Collection {
  @Prop({ type: Object, required: true })
  title: LocalizedString;

  @Prop({ type: Object, required: true })
  slug: LocalizedString;

  @Prop({ type: Object })
  description?: LocalizedString;

  @Prop({ type: [String], enum: collectionTypes, required: true })
  type: CollectionType;

  @Prop({ type: [CollectionVideoSchema] })
  videos: CollectionVideo[];

  @Prop({ type: [SeasonSchema] })
  seasons: Season[];

  @Prop({ type: [CollectionImageSchema], default: [] })
  images: CollectionImage[];

  @Prop({ type: Object })
  trailer?: LocalizedString;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

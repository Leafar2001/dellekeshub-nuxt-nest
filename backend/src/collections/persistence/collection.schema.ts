import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  type ImageType,
  imageTypes,
  collectionTypes,
  type CollectionType,
} from 'src/lib/project';
import type { LocalizedString } from '../../lib/validation/localization';

@Schema({ timestamps: true })
export class CollectionImage {
  @Prop({ type: Types.ObjectId, ref: 'Image', required: true })
  imageId: Types.ObjectId;

  @Prop({ type: [String], enum: imageTypes, required: true })
  type: ImageType;
}

export type CollectionImageDocument = CollectionImage & Document;
export const CollectionImageSchema =
  SchemaFactory.createForClass(CollectionImage);

@Schema({ timestamps: true })
export class CollectionVideo {
  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  videoId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Collection', required: true })
  collectionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Season' })
  seasonId?: Types.ObjectId;

  @Prop({ required: true })
  episodeNumber: number;
}

export type CollectionVideoDocument = CollectionVideo & Document;
export const CollectionVideoSchema =
  SchemaFactory.createForClass(CollectionVideo);

@Schema({ timestamps: true })
export class Season {
  @Prop({ type: Types.ObjectId, ref: 'Collection', required: true })
  collectionId: Types.ObjectId;

  @Prop({ required: true })
  seasonNumber: number;

  @Prop()
  videoCount: number;
}

export type SeasonDocument = Season & Document;
export const SeasonSchema = SchemaFactory.createForClass(Season);

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

  @Prop({ type: Object })
  trailer?: LocalizedString;

  @Prop()
  seasonCount?: number;

  @Prop()
  videoCount: number;
}

export type CollectionDocument = Collection & Document;
export const CollectionSchema = SchemaFactory.createForClass(Collection);

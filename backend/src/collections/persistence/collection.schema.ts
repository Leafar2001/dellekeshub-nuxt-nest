import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  type ImageType,
  imageTypes,
  collectionTypes,
  type CollectionType,
} from 'src/lib/project';
import type { LocalizedString } from '../../lib/validation/localization';

@Schema({ collection: 'collection_images', timestamps: true })
export class CollectionImageEntity {
  @Prop({ type: Types.ObjectId, ref: 'ImageEntity', required: true })
  imageId: Types.ObjectId;

  @Prop({ type: [String], enum: imageTypes, required: true })
  type: ImageType;
}

export type CollectionImage = Omit<CollectionImageEntity, keyof Document> & {
  id: string;
};
export type CollectionImageDocument = CollectionImageEntity & Document;
export const CollectionImageSchema = SchemaFactory.createForClass(
  CollectionImageEntity,
);

@Schema({ collection: 'collection_videos', timestamps: true })
export class CollectionVideoEntity {
  @Prop({ type: Types.ObjectId, ref: 'VideoEntity', required: true })
  videoId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CollectionEntity', required: true })
  collectionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SeasonEntity' })
  seasonId?: Types.ObjectId;

  @Prop({ required: true })
  episodeNumber: number;
}

export type CollectionVideo = Omit<
  CollectionVideoEntity,
  keyof Document | 'videoId' | 'collectionId' | 'seasonId'
> & {
  id: string;
  videoId: string;
  collectionId: string;
  seasonId?: string;
};
export type CollectionVideoDocument = CollectionVideoEntity & Document;
export const CollectionVideoSchema = SchemaFactory.createForClass(
  CollectionVideoEntity,
);

@Schema({ collection: 'seasons', timestamps: true })
export class SeasonEntity {
  @Prop({ type: Types.ObjectId, ref: 'CollectionEntity', required: true })
  collectionId: Types.ObjectId;

  @Prop({ required: true })
  seasonNumber: number;

  @Prop()
  videoCount: number;
}

export type Season = Omit<SeasonEntity, keyof Document> & {
  id: string;
};
export type SeasonDocument = SeasonEntity & Document;
export const SeasonSchema = SchemaFactory.createForClass(SeasonEntity);

@Schema({ collection: 'collections', timestamps: true })
export class CollectionEntity {
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

export type Collection = Omit<CollectionEntity, keyof Document> & {
  id: string;
};
export type CollectionDocument = CollectionEntity & Document;
export const CollectionSchema = SchemaFactory.createForClass(CollectionEntity);

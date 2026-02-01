import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  type ImageType,
  type LocalizedString,
  imageTypes,
} from 'src/lib/types/project';

export type CollectionDocument = Collection & Document;

@Schema({ _id: false })
class CollectionImage {
  @Prop({ type: Types.ObjectId, ref: 'Image', required: true })
  imageId: Types.ObjectId;

  @Prop({ enum: imageTypes, required: true })
  type: ImageType;

  @Prop({ default: () => new Date() })
  addedAt: Date;
}

const CollectionImageSchema = SchemaFactory.createForClass(CollectionImage);

@Schema({ _id: false })
class CollectionVideo {
  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  videoId: Types.ObjectId;

  @Prop({ required: true })
  episodeNumber: number;

  @Prop({ default: () => new Date() })
  addedAt: Date;
}

const CollectionVideoSchema = SchemaFactory.createForClass(CollectionVideo);

@Schema({ _id: false })
class Season {
  @Prop({ type: [CollectionVideoSchema], default: [] })
  episodes: CollectionVideo[];

  @Prop({ required: true })
  seasonNumber: number;
}

const SeasonSchema = SchemaFactory.createForClass(Season);

@Schema({ timestamps: true })
export class Collection {
  @Prop({ required: true })
  title: LocalizedString;

  @Prop({ required: true })
  slug: LocalizedString;

  @Prop()
  description?: LocalizedString;

  @Prop({ enum: ['movie', 'series'], required: true })
  type: 'movie' | 'series';

  @Prop({ type: [CollectionVideoSchema], default: [] })
  videos: CollectionVideo[];

  @Prop({ type: [SeasonSchema], default: [] })
  seasons: Season[];

  @Prop({ type: [CollectionImageSchema], default: [] })
  images: CollectionImage[];

  @Prop()
  trailer?: LocalizedString;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

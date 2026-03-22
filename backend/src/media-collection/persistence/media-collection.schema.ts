import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { type LocalizedString } from '../../lib/validation/localization';

export type MediaCollectionDocument = MediaCollection & Document;

export type MediaType = 'movie' | 'series';

@Schema({ timestamps: true })
export class MediaCollection {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: Object, required: true })
  title: LocalizedString;

  @Prop({ type: Object })
  description?: LocalizedString;

  @Prop({ type: String, enum: ['movie', 'series'], required: true })
  type: MediaType;

  @Prop({ type: Date })
  releaseDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Video' })
  movieVideoId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Season', default: [] })
  seasonIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Video' })
  trailerVideoId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Image', default: [] })
  posterImageIds: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Image', default: [] })
  backdropImageIds: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Image', default: [] })
  screenshotImageIds: Types.ObjectId[];

  @Prop({ type: Number })
  runtime?: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const MediaCollectionSchema =
  SchemaFactory.createForClass(MediaCollection);

MediaCollectionSchema.index({ slug: 1 }, { unique: true });
MediaCollectionSchema.index({ type: 1, isActive: 1 });
MediaCollectionSchema.index({ releaseDate: -1 });

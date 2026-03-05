import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  type ImageType,
  imageTypes,
  PersonRole,
  personRoles,
} from 'src/lib/project';
import type { LocalizedString } from '../../lib/validation/localization';

@Schema({ collection: 'subtitles' })
export class SubtitleEntity {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  path: string;

  @Prop({ default: () => new Date() })
  addedAt: Date;
}

export type Subtitle = Omit<SubtitleEntity, keyof Document> & {
  id: string;
};
const SubtitleSchema = SchemaFactory.createForClass(SubtitleEntity);

@Schema({ collection: 'video_persons', _id: false })
class VideoPersonEntity {
  @Prop({ type: Types.ObjectId, ref: 'PersonEntity', required: true })
  personId: Types.ObjectId;

  @Prop({ type: [String], enum: personRoles })
  roles: PersonRole[];

  @Prop({ default: () => new Date() })
  addedAt: Date;
}

export type VideoPerson = Omit<VideoPersonEntity, keyof Document>;
const VideoPersonSchema = SchemaFactory.createForClass(VideoPersonEntity);

@Schema({ collection: 'video_images', _id: false })
class VideoImageEntity {
  @Prop({ type: Types.ObjectId, ref: 'ImageEntity', required: true })
  imageId: Types.ObjectId;

  @Prop({ type: [String], enum: imageTypes, required: true })
  type: ImageType;

  @Prop({ default: () => new Date() })
  addedAt: Date;
}

export type VideoImage = Omit<VideoImageEntity, keyof Document>;
const VideoImageSchema = SchemaFactory.createForClass(VideoImageEntity);

@Schema({ collection: 'videos', timestamps: true })
export class VideoEntity {
  @Prop({ type: Object, required: true })
  slug: LocalizedString;

  @Prop({ type: Object, required: true })
  title: LocalizedString;

  @Prop({ type: Object })
  description?: LocalizedString;

  @Prop({ default: [] })
  genres: string[];

  @Prop({ required: true })
  path: string;

  @Prop()
  releaseDate?: Date;

  @Prop({ type: Object })
  trailer?: LocalizedString;

  @Prop({ type: [VideoImageSchema], default: [] })
  images: VideoImageEntity[];

  @Prop({ type: [SubtitleSchema], default: [] })
  subtitles: SubtitleEntity[];

  @Prop()
  duration: number;

  @Prop()
  width: number;

  @Prop()
  height: number;

  @Prop()
  size: number;

  @Prop()
  introStart: number;

  @Prop()
  introEnd: number;

  @Prop()
  outroStart: number;

  @Prop()
  outroEnd: number;

  @Prop({ type: [VideoPersonSchema], default: [] })
  persons: VideoPersonEntity[];
}

export type Video = Omit<VideoEntity, keyof Document> & {
  id: string;
};
export type VideoDocument = VideoEntity & Document;
export const VideoSchema = SchemaFactory.createForClass(VideoEntity);

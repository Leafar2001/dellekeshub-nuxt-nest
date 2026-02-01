import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  type ImageType,
  imageTypes,
  type LocalizedString,
  PersonRole,
  personRoles,
} from 'src/lib/types/project';

export type VideoDocument = Video & Document;

@Schema({ _id: false })
class Subtitle {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  path: string;

  @Prop({ default: () => new Date() })
  updatedAt: Date;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

const SubtitleSchema = SchemaFactory.createForClass(Subtitle);

@Schema({ _id: false })
class VideoPerson {
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  personId: Types.ObjectId;

  @Prop({ enum: personRoles })
  roles: PersonRole[];

  @Prop({ default: () => new Date() })
  addedAt: Date;
}

const VideoPersonSchema = SchemaFactory.createForClass(VideoPerson);

@Schema({ _id: false })
class VideoImage {
  @Prop({ type: Types.ObjectId, ref: 'Image', required: true })
  imageId: Types.ObjectId;

  @Prop({ enum: imageTypes, required: true })
  type: ImageType;

  @Prop({ default: () => new Date() })
  addedAt: Date;
}

const VideoImageSchema = SchemaFactory.createForClass(VideoImage);

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true })
  slug: LocalizedString;

  @Prop({ required: true })
  title: LocalizedString;

  @Prop()
  description?: LocalizedString;

  @Prop({ default: [] })
  genres: string[];

  @Prop({ required: true })
  path: string;

  @Prop()
  releaseDate?: Date;

  @Prop()
  trailer?: LocalizedString;

  @Prop({ type: [VideoImageSchema], default: [] })
  images: VideoImage[];

  @Prop({ type: [SubtitleSchema], default: [] })
  subtitles: Subtitle[];

  @Prop()
  duration?: number;

  @Prop()
  introStart?: number;

  @Prop()
  introEnd?: number;

  @Prop()
  outroStart?: number;

  @Prop()
  outroEnd?: number;

  @Prop({ type: [VideoPersonSchema], default: [] })
  persons: VideoPerson[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);

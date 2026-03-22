import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ type: Number })
  duration?: number;

  @Prop({ default: false })
  isTranscoded: boolean;
}

export const VideoSchema = SchemaFactory.createForClass(Video);

VideoSchema.index({ isTranscoded: 1 });

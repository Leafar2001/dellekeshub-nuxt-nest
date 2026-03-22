import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

export type ImageType = 'poster' | 'backdrop' | 'thumbnail' | 'screenshot';

@Schema({ timestamps: true })
export class Image {
  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  filename: string;

  @Prop({
    required: true,
    enum: ['poster', 'backdrop', 'thumbnail', 'screenshot'],
  })
  type: ImageType;
}

export const ImageSchema = SchemaFactory.createForClass(Image);

ImageSchema.index({ type: 1 });

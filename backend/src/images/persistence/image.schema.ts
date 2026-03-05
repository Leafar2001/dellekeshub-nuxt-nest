import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = ImageEntity & Document;

@Schema({ collection: 'images', timestamps: true })
export class ImageEntity {
  @Prop({ required: true })
  path: string;

  @Prop()
  name: string;

  @Prop()
  slug: string;

  @Prop()
  extension: string;

  @Prop()
  width: number;

  @Prop()
  height: number;
}

export const ImageSchema = SchemaFactory.createForClass(ImageEntity);

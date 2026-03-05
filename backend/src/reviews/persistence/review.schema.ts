import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type ReviewDocument = ReviewEntity & Document;

@Schema({ collection: 'reviews', timestamps: true })
export class ReviewEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media', required: true })
  mediaId: Types.ObjectId;

  @Prop({ min: 1, max: 5, required: true })
  rating: number;

  @Prop()
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(ReviewEntity);

ReviewSchema.index({ userId: 1, mediaId: 1 }, { unique: true }); // Max 1 review per user per media

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WatchProgressDocument = WatchProgress & Document;

@Schema({ timestamps: true })
export class WatchProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media', required: true })
  mediaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  videoId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  currentTime: number;

  @Prop({ type: Boolean, default: false })
  finished: boolean;
}

export const WatchProgressSchema = SchemaFactory.createForClass(WatchProgress);

WatchProgressSchema.index({ userId: 1, mediaId: 1 }, { unique: true });
WatchProgressSchema.index({ userId: 1 });

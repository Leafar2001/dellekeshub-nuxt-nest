import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WatchProgressDocument = WatchProgressEntity & Document;

@Schema({ collection: 'watch_progress', timestamps: true })
export class WatchProgressEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media', required: true })
  mediaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  episodeId: Types.ObjectId;

  @Prop({ default: 0 })
  currentTime: number;

  @Prop()
  duration?: number;

  @Prop({ default: false })
  finished: boolean;
}

export const WatchProgressSchema =
  SchemaFactory.createForClass(WatchProgressEntity);

WatchProgressSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

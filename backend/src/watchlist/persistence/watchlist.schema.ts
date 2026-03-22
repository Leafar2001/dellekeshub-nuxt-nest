import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WatchlistDocument = Watchlist & Document;

@Schema({ timestamps: true })
export class Watchlist {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media', required: true })
  mediaId: Types.ObjectId;
}

export const WatchlistSchema = SchemaFactory.createForClass(Watchlist);

WatchlistSchema.index({ userId: 1, mediaId: 1 }, { unique: true });
WatchlistSchema.index({ userId: 1 });
WatchlistSchema.index({ mediaId: 1 });

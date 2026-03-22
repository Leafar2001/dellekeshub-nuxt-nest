import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SeasonDocument = Season & Document;

@Schema({ timestamps: true })
export class Season {
  @Prop({ type: Types.ObjectId, ref: 'MediaCollection', required: true })
  seriesId: Types.ObjectId;

  @Prop({ required: true })
  seasonNumber: number;

  @Prop({ type: Types.ObjectId, ref: 'Image' })
  posterImageId?: Types.ObjectId;

  @Prop({ default: 0 })
  episodeCount: number;
}

export const SeasonSchema = SchemaFactory.createForClass(Season);

SeasonSchema.index({ seriesId: 1, seasonNumber: 1 }, { unique: true });
SeasonSchema.index({ seriesId: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { type LocalizedString } from '../../lib/validation/localization';

export type EpisodeDocument = Episode & Document;

@Schema({ timestamps: true })
export class Episode {
  @Prop({ type: Types.ObjectId, ref: 'MediaCollection', required: true })
  seriesId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Season', required: true })
  seasonId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  videoId: Types.ObjectId;

  @Prop({ required: true })
  episodeNumber: number;

  @Prop({ type: Object })
  title?: LocalizedString;

  @Prop({ type: Object })
  description?: LocalizedString;

  @Prop({ type: Date })
  airDate?: Date;
}

export const EpisodeSchema = SchemaFactory.createForClass(Episode);

EpisodeSchema.index(
  { seriesId: 1, seasonId: 1, episodeNumber: 1 },
  { unique: true },
);
EpisodeSchema.index({ seasonId: 1 });
EpisodeSchema.index({ seriesId: 1 });

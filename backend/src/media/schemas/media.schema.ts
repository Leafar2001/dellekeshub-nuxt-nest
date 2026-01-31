import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ _id: false })
class Episode {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  videoPath: string;

  @Prop()
  subtitlePath?: string;

  @Prop()
  thumbnailPath?: string;

  @Prop()
  durationSeconds?: number;

  @Prop({ required: true })
  episodeNumber: number;
}

const EpisodeSchema = SchemaFactory.createForClass(Episode);

@Schema({ _id: false })
class Season {
  @Prop({ required: true })
  seasonNumber: number;

  @Prop({ type: [EpisodeSchema], default: [] })
  episodes: Episode[];
}

const SeasonSchema = SchemaFactory.createForClass(Season);

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  title: string;

  @Prop()
  year?: number;

  @Prop()
  description?: string;

  @Prop({ enum: ['movie', 'series'], required: true })
  type: 'movie' | 'series';

  @Prop({ type: [SeasonSchema], default: [] })
  videos?: Season[];

  @Prop()
  thumbnailPath?: string;

  @Prop()
  trailerUrl?: string;

  @Prop()
  genres?: string[];

  @Prop()
  actors?: string[];

  @Prop()
  directors?: string[];
}

export const MediaSchema = SchemaFactory.createForClass(Media);

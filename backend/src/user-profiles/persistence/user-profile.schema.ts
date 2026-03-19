import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { locales, type Locale } from '../../lib/project';

export type UserProfileDocument = UserProfile & Document;

@Schema({ timestamps: true })
export class UserProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', unique: true, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, default: '' })
  displayName: string;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({ type: String, default: '' })
  avatarB64: string;

  @Prop({ type: String, default: '' })
  bannerB64: string;

  @Prop({ type: [String], default: [] })
  favoriteGenres: string[];

  @Prop({ type: String, enum: locales, default: 'en-US' })
  preferredLocale: Locale;

  @Prop({ type: Boolean, default: false })
  autoPlay: boolean;

  @Prop({ type: Boolean, default: false })
  autoplayNextEpisode: boolean;

  @Prop({ type: Number, default: 0 })
  volume: number;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

UserProfileSchema.index({ userId: 1 }, { unique: true });

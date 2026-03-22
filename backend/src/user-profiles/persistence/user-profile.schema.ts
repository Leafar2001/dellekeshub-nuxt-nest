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

  @Prop({ type: Types.ObjectId, ref: 'Image' })
  avatarImageId?: Types.ObjectId;

  @Prop({ type: String, enum: locales, default: 'en-US' })
  preferredLocale: Locale;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

UserProfileSchema.index({ userId: 1 }, { unique: true });

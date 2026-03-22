import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserProfile,
  UserProfileDocument,
} from './persistence/user-profile.schema';

export type UpdateProfileData = Partial<
  Pick<UserProfile, 'displayName' | 'bio' | 'avatarImageId' | 'preferredLocale'>
>;

@Injectable()
export class UserProfilesService {
  private readonly logger = new Logger(UserProfilesService.name);

  constructor(
    @InjectModel(UserProfile.name)
    private profileModel: Model<UserProfileDocument>,
  ) {}

  async createOrGet(userId: string): Promise<UserProfileDocument> {
    const existing = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (existing) return existing;

    const profile = await this.profileModel.create({
      userId: new Types.ObjectId(userId),
    });
    this.logger.log(`Created profile for user: ${userId}`);
    return profile;
  }

  async findByUserId(userId: string): Promise<UserProfileDocument | null> {
    return this.profileModel.findOne({ userId: new Types.ObjectId(userId) });
  }

  async findByUserIdOrThrow(userId: string): Promise<UserProfileDocument> {
    const profile = await this.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async update(
    userId: string,
    data: UpdateProfileData,
  ): Promise<UserProfileDocument> {
    const profile = await this.findByUserIdOrThrow(userId);
    Object.assign(profile, data);
    return profile.save();
  }

  async getPublicProfile(userId: string): Promise<{
    displayName: string;
    avatarImageId?: string;
    bio: string;
  } | null> {
    const profile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!profile) return null;
    return {
      displayName: profile.displayName,
      avatarImageId: profile.avatarImageId?.toString(),
      bio: profile.bio,
    };
  }
}

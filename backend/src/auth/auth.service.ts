import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import * as bcrypt from 'bcrypt';

interface UserWithTimestamp {
  _id: { toString(): string };
  username: string;
  role: string;
  createdAt?: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private profilesService: UserProfilesService,
  ) {}

  async register(username: string, password: string) {
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) throw new ConflictException('Username already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ username, password: hashed });
    await this.profilesService.createOrGet(user._id.toString());
    return user;
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  async getFullUserData(userId: string) {
    const user = (await this.usersService.findById(
      userId,
    )) as UserWithTimestamp | null;
    if (!user) return null;

    const profile = await this.profilesService.findByUserId(userId);
    if (!profile) {
      return {
        _id: user._id.toString(),
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        profile: null,
      };
    }

    return {
      _id: user._id.toString(),
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      profile: {
        displayName: profile.displayName,
        bio: profile.bio,
        avatarImageId: profile.avatarImageId,
        preferredLocale: profile.preferredLocale,
      },
    };
  }
}

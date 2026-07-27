import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from 'better-auth/crypto';
import { User } from './persistence/user.entity';
import type { CreateUser } from './validation/create-user-schema';
import type { RegisterUser } from './validation/register-user-schema';
import type { UpdateMe } from './validation/update-me-schema';
import type { UpdateUser } from './validation/update-user-schema';
import { InvitesService } from '../invites/invites.service';
import { auth } from '../auth/auth';

const SAFE_SELECT = [
  'id',
  'name',
  'email',
  'username',
  'displayUsername',
  'role',
  'avatarB64',
  'createdAt',
  'updatedAt',
] as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly invitesService: InvitesService,
  ) {}

  getAllUsers() {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
      select: [...SAFE_SELECT],
    });
  }

  findById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      select: [...SAFE_SELECT],
    });
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
      select: [...SAFE_SELECT],
    });
  }

  async createUser(data: CreateUser) {
    const existing = await this.userRepository.findOne({
      where: { username: data.username },
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const user = this.userRepository.create({
      name: data.username,
      username: data.username,
      role: data.role,
    });
    const savedUser = await this.userRepository.save(user);

    const passwordHash = await hashPassword(data.password);
    await this.userRepository.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, 'credential', $2, $3, NOW(), NOW())`,
      [savedUser.id, savedUser.id, passwordHash],
    );

    return {
      id: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
    };
  }

  async register(data: RegisterUser) {
    const invite = await this.invitesService.assertValid(data.inviteCode);

    const existing = await this.userRepository.findOne({
      where: { username: data.username },
    });
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    let userId: string;

    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: `${data.username}@dellekeshub.local`,
          password: data.password,
          name: data.username,
          username: data.username,
        } as never,
      });

      userId = result.user.id;
    } catch (error) {
      this.logger.error('Registration via better-auth failed', error);
      throw new BadRequestException('Registration failed');
    }

    await this.invitesService.markUsed(invite.id, userId);

    return { success: true };
  }

  async updateMe(userId: string, data: UpdateMe) {
    const patch: Record<string, unknown> = {};

    if (data.name !== undefined) patch.name = data.name;
    if (data.email !== undefined) patch.email = data.email || null;
    if (data.avatarB64 !== undefined) patch.avatarB64 = data.avatarB64;

    if (Object.keys(patch).length === 0) {
      return this.findById(userId);
    }

    try {
      await this.userRepository.update(userId, patch);
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }

    return this.findById(userId);
  }

  async updateUser(id: string, data: UpdateUser) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const patch: Record<string, unknown> = {};

    if (data.username !== undefined && data.username !== user.username) {
      const existing = await this.userRepository.findOne({
        where: { username: data.username },
      });
      if (existing) {
        throw new ConflictException('Username already exists');
      }
      patch.username = data.username;
      patch.name = data.username;
    }

    if (data.role !== undefined) patch.role = data.role;

    if (Object.keys(patch).length > 0) {
      await this.userRepository.update(id, patch);
    }

    return this.findById(id);
  }

  async deleteUser(id: string, requestingUserId: string) {
    if (id === requestingUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const result = await this.userRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('User not found');
    }

    return { success: true };
  }
}

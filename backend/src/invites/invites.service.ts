import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { InviteCode } from './persistence/invite-code.entity';

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(InviteCode)
    private readonly inviteRepository: Repository<InviteCode>,
  ) {}

  findAll() {
    return this.inviteRepository.find({
      relations: { createdBy: true, usedBy: true },
      order: { createdAt: 'DESC' },
    });
  }

  async create(createdById: string) {
    const code =
      `${randomBytes(2).toString('hex')}-${randomBytes(2).toString('hex')}`.toUpperCase();

    const invite = this.inviteRepository.create({
      code,
      createdById,
      usedById: null,
      usedAt: null,
    });

    return this.inviteRepository.save(invite);
  }

  async remove(id: string) {
    const result = await this.inviteRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Invite not found');
    }

    return { success: true };
  }

  async assertValid(code: string): Promise<InviteCode> {
    const invite = await this.inviteRepository.findOne({
      where: { code: code.trim(), usedAt: IsNull() },
    });

    if (!invite) {
      throw new BadRequestException('Invalid or already used invite code');
    }

    return invite;
  }

  async markUsed(id: string, userId: string) {
    await this.inviteRepository.update(id, {
      usedById: userId,
      usedAt: new Date(),
    });
  }
}

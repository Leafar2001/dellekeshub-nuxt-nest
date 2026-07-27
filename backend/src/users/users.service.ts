import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './persistence/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getAllUsers() {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'name',
        'email',
        'username',
        'displayUsername',
        'role',
        'avatarB64',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  findById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'username',
        'displayUsername',
        'role',
        'avatarB64',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
    });
  }
}

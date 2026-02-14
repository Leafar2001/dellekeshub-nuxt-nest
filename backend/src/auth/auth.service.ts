import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/persistence/user.schema';
import type { RegistrationRequest } from './validation/registration-schema';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(body: RegistrationRequest): Promise<UserDocument> {
    const { username, password, role } = body;

    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) throw new ConflictException('Username already exists');

    const hashed = await bcrypt.hash(password, 10);
    return this.usersService.create({ username, password: hashed, role });
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
}

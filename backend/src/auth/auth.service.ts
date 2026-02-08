import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(username: string, password: string) {
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) throw new ConflictException('Username already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ username, password: hashed });
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
}

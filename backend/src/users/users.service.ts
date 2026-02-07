import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './persistence/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  getAllUsers() {
    return this.userModel.find();
  }

  findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  findById(id: string) {
    return this.userModel.findById(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUserModel, User, UserDocument } from './entities/user.entity';
import { DbId } from '../types/types';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private usersModel: IUserModel) {}
  async getById(id: DbId): Promise<UserDocument> {
    return this.usersModel.findById(id);
  }
  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }
  async delete(id: DbId): Promise<UserDocument> {
    return this.usersModel.findByIdAndDelete(id);
  }
}

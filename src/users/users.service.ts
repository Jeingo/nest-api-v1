import { Injectable } from '@nestjs/common';
import { InputCreateUserDto } from './dto/input.create.user.dto';
import { DbId } from '../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { UsersRepository } from './users.repository';
import { IUserModel, User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectModel(User.name) private usersModel: IUserModel
  ) {}

  async create(createUserDto: InputCreateUserDto): Promise<DbId> {
    const { login, password, email } = createUserDto;
    const createdUser = this.usersModel.make(login, password, email, true);
    await this.usersRepository.save(createdUser);
    return createdUser._id;
  }

  async remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

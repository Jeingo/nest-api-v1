import { Injectable, NotFoundException } from '@nestjs/common';
import { InputCreateUserDto } from './dto/input.create.user.dto';
import { DbId } from '../global-types/global.types';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: InputCreateUserDto): Promise<DbId> {
    const { login, password, email } = createUserDto;
    const createdUser = this.usersRepository.create(
      login,
      password,
      email,
      true
    );
    await this.usersRepository.save(createdUser);
    return createdUser._id;
  }

  async remove(id: DbId): Promise<boolean> {
    const user = await this.usersRepository.getById(id);
    if (!user) throw new NotFoundException();
    await this.usersRepository.delete(id);
    return true;
  }
}

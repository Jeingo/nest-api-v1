import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { InputLoginUserDto } from './dto/input.login.user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async checkCredentials(
    loginUserDto: InputLoginUserDto
  ): Promise<string | false> {
    const { loginOrEmail, password } = loginUserDto;
    const user = await this.usersRepository.getByUniqueField(loginOrEmail);
    if (!user) return false;
    const result = await bcrypt.compare(password, user.hash);
    if (!result) {
      return false;
    }
    return user._id.toString();
  }
}

import { UsersRepository } from '../../users/users.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { InputLoginUserDto } from '../dto/input.login.user.dto';
import bcrypt from 'bcrypt';
import { DbId } from '../../global-types/global.types';

export class ValidateUserInLoginCommand {
  constructor(public loginUserDto: InputLoginUserDto) {}
}

@CommandHandler(ValidateUserInLoginCommand)
export class ValidateUserInLoginUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ValidateUserInLoginCommand): Promise<DbId | null> {
    const { loginOrEmail, password } = command.loginUserDto;
    const user = await this.usersRepository.getByUniqueField(loginOrEmail);
    if (!user) return null;
    const result = await bcrypt.compare(password, user.hash);
    if (!result) {
      return null;
    }
    return user._id;
  }
}

import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../global-types/global.types';
import { UsersRepository } from '../../../users/users.repository';
import { InputBanUserDto } from '../dto/input.ban.user.dto';

export class BanUserCommand {
  constructor(public banUserDto: InputBanUserDto, public id: DbId) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: BanUserCommand): Promise<boolean> {
    const { isBanned, banReason } = command.banUserDto;
    const user = await this.usersRepository.getById(command.id);
    user.ban(isBanned, banReason);
    await this.usersRepository.save(user);
    return true;
  }
}

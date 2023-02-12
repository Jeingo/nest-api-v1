import { UsersRepository } from '../../users/users.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { InputEmailDto } from '../dto/input.email.dto';
import { EmailManager } from '../../adapters/email/email.manager';

export class ResendEmailConfirmationCommand {
  constructor(public emailDto: InputEmailDto) {}
}

@CommandHandler(ResendEmailConfirmationCommand)
export class ResendEmailConfirmationUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailManager: EmailManager
  ) {}

  async execute(command: ResendEmailConfirmationCommand): Promise<boolean> {
    const user = await this.usersRepository.getByUniqueField(
      command.emailDto.email
    );
    user.updateConfirmationCode();
    await this.usersRepository.save(user);
    await this.emailManager.sendRegistrationEmailConfirmation(user);
    return true;
  }
}

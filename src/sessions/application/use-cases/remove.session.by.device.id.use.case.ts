import { CommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class RemoveSessionByDeviceIdCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(RemoveSessionByDeviceIdCommand)
export class RemoveSessionByDeviceIdUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionByDeviceIdCommand): Promise<boolean> {
    const session = await this.sessionsRepository.get(command.id);
    if (!session) throw new NotFoundException();
    if (session.userId !== command.userId) throw new ForbiddenException();
    return await this.sessionsRepository.deleteSession(session.issueAt);
  }
}

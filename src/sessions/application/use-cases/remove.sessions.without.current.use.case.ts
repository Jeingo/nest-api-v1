import { CommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class RemoveSessionWithoutCurrentCommand {
  constructor(public userId: string, public iat: number) {}
}

@CommandHandler(RemoveSessionWithoutCurrentCommand)
export class RemoveSessionWithoutCurrentUseCase {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async execute(command: RemoveSessionWithoutCurrentCommand): Promise<boolean> {
    const issueAt = new Date(command.iat * 1000).toISOString();
    return await this.sessionsRepository.deleteSessionsWithoutCurrent(
      command.userId,
      issueAt
    );
  }
}

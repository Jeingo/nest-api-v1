import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../global-types/global.types';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../configuration/configuration';
import { JwtService } from '@nestjs/jwt';
import { SessionsRepository } from '../sessions.repository';

export class CreateSessionCommand {
  constructor(
    public refreshToken: string,
    public ip: string,
    public deviceName: string
  ) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly jwtService: JwtService,
    private readonly sessionsRepository: SessionsRepository
  ) {}

  async execute(command: CreateSessionCommand): Promise<DbId> {
    const result = this.jwtService.verify(command.refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    const issueAt = new Date(result.iat * 1000).toISOString();
    const expireAt = new Date(result.exp * 1000).toISOString();
    const userId = result.userId;
    const deviceId = result.deviceId;

    const session = this.sessionsRepository.create(
      issueAt,
      deviceId,
      command.deviceName,
      command.ip,
      userId,
      expireAt
    );
    await this.sessionsRepository.save(session);
    return session._id;
  }
}

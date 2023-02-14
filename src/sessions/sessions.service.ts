import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../configuration/configuration';
import { SessionsRepository } from './sessions.repository';

@Injectable()
export class SessionsService {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly jwtService: JwtService,
    private readonly sessionsRepository: SessionsRepository
  ) {}
  async deleteSessionByDeviceId(id: string, userId: string): Promise<boolean> {
    const session = await this.sessionsRepository.get(id);
    if (!session) throw new NotFoundException();
    if (session.userId !== userId) throw new ForbiddenException();
    return await this.sessionsRepository.deleteSession(session.issueAt);
  }
}

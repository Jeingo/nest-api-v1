import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../configuration/configuration';
import { SessionsRepository } from './sessions.repository';
import { Token } from '../adapters/jwt/types/jwt.type';

@Injectable()
export class SessionsService {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly jwtService: JwtService,
    private readonly sessionsRepository: SessionsRepository
  ) {}
  async update(refreshToken: Token): Promise<boolean> {
    const result = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    const issueAt = new Date(result.iat * 1000).toISOString();
    const expireAt = new Date(result.exp * 1000).toISOString();
    const deviceId = result.deviceId;
    return await this.sessionsRepository.updateSession(
      issueAt,
      expireAt,
      deviceId
    );
  }
  async isActiveSession(deviceId: string): Promise<boolean> {
    const result = await this.sessionsRepository.get(deviceId);
    return !!result;
  }
  async deleteSession(iat: number): Promise<boolean> {
    const issueAt = new Date(iat * 1000).toISOString();
    return await this.sessionsRepository.deleteSession(issueAt);
  }
  async deleteActiveSessionWithoutCurrent(
    userId: string,
    iat: number
  ): Promise<boolean> {
    const issueAt = new Date(iat * 1000).toISOString();
    return await this.sessionsRepository.deleteSessionsWithoutCurrent(
      userId,
      issueAt
    );
  }
  async deleteSessionByDeviceId(id: string, userId: string): Promise<boolean> {
    const session = await this.sessionsRepository.get(id);
    if (!session) throw new NotFoundException();
    if (session.userId !== userId) throw new ForbiddenException();
    return await this.sessionsRepository.deleteSession(session.issueAt);
  }
}

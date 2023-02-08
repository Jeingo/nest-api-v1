import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../configuration/configuration';
import { InjectModel } from '@nestjs/mongoose';
import { ISessionModel, Session } from './entities/session.entity';
import { SessionsRepository } from './sessions.repository';
import { DbId } from '../types/types';
import { Token } from '../infrastructure/types/jwt.type';

@Injectable()
export class SessionsService {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly jwtService: JwtService,
    private readonly sessionsRepository: SessionsRepository,
    @InjectModel(Session.name) private sessionsModel: ISessionModel
  ) {}
  async saveSession(
    refreshToken: string,
    ip: string,
    deviceName: string
  ): Promise<DbId> {
    const result = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('JWT_REFRESH_SECRET')
    });
    const issueAt = new Date(result.iat * 1000).toISOString();
    const expireAt = new Date(result.exp * 1000).toISOString();
    const userId = result.userId;
    const deviceId = result.deviceId;

    const session = this.sessionsModel.make(
      issueAt,
      deviceId,
      deviceName,
      ip,
      userId,
      expireAt
    );
    await this.sessionsRepository.save(session);
    return session._id;
  }
  async updateSession(refreshToken: Token): Promise<boolean> {
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
  async isActiveSession(deviceId: string, iat: string): Promise<boolean> {
    const result = await this.sessionsRepository.get(iat);
    if (!result) return false;
    return result.deviceId === deviceId;
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

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../configuration/configuration';
import { InjectModel } from '@nestjs/mongoose';
import { ISessionModel, Session } from './entities/session.entity';
import { SessionsRepository } from './sessions.repository';
import { DbId } from '../types/types';

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
}

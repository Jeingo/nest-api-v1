import { Injectable } from '@nestjs/common';
import {
  ISessionModel,
  Session,
  SessionDocument
} from './entities/session.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.name) private sessionsModel: ISessionModel
  ) {}
  async save(session: SessionDocument): Promise<SessionDocument> {
    return session.save();
  }
  async get(iat: string): Promise<SessionDocument> {
    return this.sessionsModel.findOne({ issueAt: iat });
  }
  async updateSession(
    issueAt: string,
    expireAt: string,
    deviceId: string
  ): Promise<boolean> {
    const result = await this.sessionsModel.findOneAndUpdate(
      { deviceId: deviceId },
      { issueAt: issueAt, expireAt: expireAt }
    );
    return !!result;
  }
}

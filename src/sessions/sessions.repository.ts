import { Injectable } from '@nestjs/common';
import { SessionDocument } from './entities/session.entity';

@Injectable()
export class SessionsRepository {
  async save(session: SessionDocument): Promise<SessionDocument> {
    return session.save();
  }
}

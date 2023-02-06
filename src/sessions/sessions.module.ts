import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionsRepository } from './sessions.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './entities/session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }])
  ],
  providers: [SessionsService, JwtService, ConfigService, SessionsRepository]
})
export class SessionsModule {}

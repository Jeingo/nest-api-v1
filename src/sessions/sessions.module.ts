import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionsRepository } from './sessions.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './entities/session.entity';
import { SecurityDevicesController } from './security.devices.controller';
import { AuthService } from '../auth/auth.service';
import { UsersRepository } from '../users/users.repository';
import { IJwtService } from '../infrastructure/jwt/jwt.service';
import { EmailManager } from '../infrastructure/email/email.manager';
import { User, UserSchema } from '../users/entities/user.entity';
import { EmailService } from '../infrastructure/email/email.service';
import { SessionsQueryRepository } from './sessions.query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [SecurityDevicesController],
  providers: [
    SessionsService,
    JwtService,
    ConfigService,
    SessionsRepository,
    AuthService,
    UsersRepository,
    IJwtService,
    JwtService,
    EmailManager,
    EmailService,
    SessionsQueryRepository
  ]
})
export class SessionsModule {}

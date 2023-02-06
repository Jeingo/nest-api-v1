import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { IJwtService } from '../infrastructure/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from '../sessions/sessions.service';
import { SessionsRepository } from '../sessions/sessions.repository';
import { Session, SessionSchema } from '../sessions/entities/session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema }
    ])
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    UsersService,
    IJwtService,
    JwtService,
    SessionsService,
    SessionsRepository
  ]
})
export class AuthModule {}

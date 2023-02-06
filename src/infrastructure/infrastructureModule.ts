import { Module } from '@nestjs/common';
import { IJwtService } from './jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email/email.service';
import { EmailManager } from './email/email.manager';

@Module({
  controllers: [],
  providers: [IJwtService, JwtService, EmailService, EmailManager]
})
export class InfrastructureModule {}

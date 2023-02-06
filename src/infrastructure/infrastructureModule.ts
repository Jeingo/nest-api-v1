import { Module } from '@nestjs/common';
import { IJwtService } from './jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [],
  providers: [IJwtService, JwtService]
})
export class InfrastructureModule {}

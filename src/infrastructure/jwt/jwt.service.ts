import { Injectable } from '@nestjs/common';
import { Token, TokenPayloadType, Tokens } from '../types/jwt.type';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../configuration/configuration';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class IJwtService {
  constructor(
    private readonly configService: ConfigService<IConfigType>,
    private readonly jwtService: JwtService
  ) {}
  getTokens(userId: string, deviceId: string): Tokens {
    const accessToken = this.createJWT(userId);
    const refreshToken = this.createRefreshJWT(userId, deviceId);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
  checkExpirationRefreshToken(token: Token): boolean {
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET')
      });
      return true;
    } catch {
      return false;
    }
  }
  checkExpirationAccessToken(token: Token): boolean {
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET')
      });
      return true;
    } catch {
      return false;
    }
  }
  getPayload(token: Token): TokenPayloadType | null {
    try {
      return this.jwtService.decode(token) as TokenPayloadType;
    } catch {
      return null;
    }
  }
  private createJWT(userId: string): Token {
    return this.jwtService.sign(
      { userId: userId },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('EXPIRE_JWT')
      }
    );
  }
  private createRefreshJWT(userId: string, deviceId: string): Token {
    return this.jwtService.sign(
      { userId: userId, deviceId: deviceId },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('EXPIRE_REFRESH_JWT')
      }
    );
  }
}

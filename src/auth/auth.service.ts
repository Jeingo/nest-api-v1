import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { Token, RefreshTokenPayloadType } from '../adapters/jwt/types/jwt.type';
import { JwtAdapter } from '../adapters/jwt/jwt.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtAdapter: JwtAdapter,
    private readonly sessionsService: SessionsService
  ) {}

  async checkAuthorizationAndGetPayload(
    refreshToken: Token
  ): Promise<RefreshTokenPayloadType | false> {
    const result = this.jwtAdapter.checkExpirationRefreshToken(refreshToken);
    if (!result) return false;
    const payload = this.jwtAdapter.getRefreshTokenPayload(refreshToken);
    const statusSession = await this.sessionsService.isActiveSession(
      payload.deviceId
    );
    if (!statusSession) return false;
    return payload;
  }
}

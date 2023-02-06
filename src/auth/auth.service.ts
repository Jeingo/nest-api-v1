import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { InputLoginUserDto } from './dto/input.login.user.dto';
import * as bcrypt from 'bcrypt';
import { Token, TokenPayloadType } from '../infrastructure/types/jwt.type';
import { IJwtService } from '../infrastructure/jwt/jwt.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: IJwtService,
    private readonly sessionsService: SessionsService
  ) {}

  async checkCredentials(
    loginUserDto: InputLoginUserDto
  ): Promise<string | false> {
    const { loginOrEmail, password } = loginUserDto;
    const user = await this.usersRepository.getByUniqueField(loginOrEmail);
    if (!user) return false;
    const result = await bcrypt.compare(password, user.hash);
    if (!result) {
      return false;
    }
    return user._id.toString();
  }

  async checkAuthorizationAndGetPayload(
    refreshToken: Token
  ): Promise<TokenPayloadType | false> {
    const result = this.jwtService.checkExpiration(refreshToken);
    if (!result) return false;
    const payload = this.jwtService.getPayload(refreshToken);
    const statusSession = await this.sessionsService.isActiveSession(
      payload.deviceId,
      payload.iat.toString()
    );
    if (statusSession) return false;
    return payload;
  }
}

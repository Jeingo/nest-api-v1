import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { Token, RefreshTokenPayloadType } from '../adapters/jwt/types/jwt.type';
import { JwtAdapter } from '../adapters/jwt/jwt.service';
import { SessionsService } from '../sessions/sessions.service';
import { EmailManager } from '../adapters/email/email.manager';
import { InputRecoveryEmailDto } from './dto/input.recovery.email.dto';
import { InputNewPasswordDto } from './dto/input.newpassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtAdapter: JwtAdapter,
    private readonly sessionsService: SessionsService,
    private readonly emailManager: EmailManager
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
  async recoveryPassword(
    recoveryEmailDto: InputRecoveryEmailDto
  ): Promise<boolean> {
    const user = await this.usersRepository.getByUniqueField(
      recoveryEmailDto.email
    );
    if (!user) return false;
    user.updatePasswordRecoveryConfirmationCode();
    await this.usersRepository.save(user);
    await this.emailManager.sendPasswordRecoveryEmailConfirmation(user);
    return true;
  }
  async setNewPassword(newPasswordDto: InputNewPasswordDto): Promise<boolean> {
    const { recoveryCode, newPassword } = newPasswordDto;
    const user = await this.usersRepository.getByUniqueField(recoveryCode);
    user.updatePassword(newPassword);
    await this.usersRepository.save(user);
    return true;
  }
}

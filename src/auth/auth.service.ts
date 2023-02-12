import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { InputLoginUserDto } from './dto/input.login.user.dto';
import bcrypt from 'bcrypt';
import { Token, TokenPayloadType } from '../adapters/jwt/types/jwt.type';
import { JwtAdapter } from '../adapters/jwt/jwt.service';
import { SessionsService } from '../sessions/sessions.service';
import { InputRegistrationUserDto } from './dto/input.registration.user.dto';
import { DbId } from '../global-types/global.types';
import { EmailManager } from '../adapters/email/email.manager';
import { InputConfirmationCodeDto } from './dto/input.confirmation.code.dto';
import { InputEmailDto } from './dto/input.email.dto';
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

  async validateUser(loginUserDto: InputLoginUserDto): Promise<DbId | null> {
    const { loginOrEmail, password } = loginUserDto;
    const user = await this.usersRepository.getByUniqueField(loginOrEmail);
    if (!user) return null;
    const result = await bcrypt.compare(password, user.hash);
    if (!result) {
      return null;
    }
    return user._id;
  }
  async checkAuthorizationAndGetPayload(
    refreshToken: Token
  ): Promise<TokenPayloadType | false> {
    const result = this.jwtAdapter.checkExpirationRefreshToken(refreshToken);
    if (!result) return false;
    const payload = this.jwtAdapter.getPayload(refreshToken);
    const statusSession = await this.sessionsService.isActiveSession(
      payload.deviceId
    );
    if (!statusSession) return false;
    return payload;
  }
  async registration(
    registrationUserDto: InputRegistrationUserDto
  ): Promise<DbId> {
    const { login, password, email } = registrationUserDto;
    const createdUser = this.usersRepository.create(
      login,
      password,
      email,
      false
    );
    await this.usersRepository.save(createdUser);
    await this.emailManager.sendRegistrationEmailConfirmation(createdUser);
    return createdUser._id;
  }
  async confirmEmail(
    confirmationCodeDto: InputConfirmationCodeDto
  ): Promise<boolean> {
    const user = await this.usersRepository.getByUniqueField(
      confirmationCodeDto.code
    );
    user.updateEmailConfirmationStatus();
    await this.usersRepository.save(user);
    return true;
  }
  async resendEmail(emailDto: InputEmailDto): Promise<boolean> {
    const user = await this.usersRepository.getByUniqueField(emailDto.email);
    user.updateConfirmationCode();
    await this.usersRepository.save(user);
    await this.emailManager.sendRegistrationEmailConfirmation(user);
    return true;
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

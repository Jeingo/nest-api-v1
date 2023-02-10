import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { InputLoginUserDto } from './dto/input.login.user.dto';
import * as bcrypt from 'bcrypt';
import { Token, TokenPayloadType } from '../infrastructure/types/jwt.type';
import { JwtAdapter } from '../infrastructure/jwt/jwt.service';
import { SessionsService } from '../sessions/sessions.service';
import { InputRegistrationUserDto } from './dto/input.registration.user.dto';
import { DbId } from '../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { IUserModel, User } from '../users/entities/user.entity';
import { EmailManager } from '../infrastructure/email/email.manager';
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
    private readonly emailManager: EmailManager,
    @InjectModel(User.name) private usersModel: IUserModel
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
    const result = this.jwtAdapter.checkExpirationRefreshToken(refreshToken);
    if (!result) return false;
    const payload = this.jwtAdapter.getPayload(refreshToken);
    const statusSession = await this.sessionsService.isActiveSession(
      payload.deviceId
    );
    if (!statusSession) return false;
    return payload;
  }
  async checkLoginAndEmail(
    registrationUserDto: InputRegistrationUserDto
  ): Promise<boolean> {
    const { login, email } = registrationUserDto;
    const errorList = [];
    const checkLogin = await this.usersRepository.getByUniqueField(login);
    if (checkLogin) errorList.push('login is already exist');

    const checkEmail = await this.usersRepository.getByUniqueField(email);
    if (checkEmail) errorList.push('email is already exist');

    if (errorList.length > 0) throw new BadRequestException(errorList);

    return true;
  }
  async registration(
    registrationUserDto: InputRegistrationUserDto
  ): Promise<DbId> {
    const { login, password, email } = registrationUserDto;
    const createdUser = this.usersModel.make(login, password, email, false);
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
    if (!user) {
      throw new BadRequestException(['code code is wrong']);
    }
    if (user.emailConfirmation.confirmationCode !== confirmationCodeDto.code) {
      throw new BadRequestException(['code code is wrong']);
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException(['code Account is already confirmed']);
    }
    if (user.emailConfirmation.expirationDate < new Date()) {
      throw new BadRequestException(['code code is expired']);
    }

    user.updateEmailConfirmationStatus();
    await this.usersRepository.save(user);
    return true;
  }
  async resendEmail(emailDto: InputEmailDto): Promise<boolean> {
    const user = await this.usersRepository.getByUniqueField(emailDto.email);
    if (!user) {
      throw new BadRequestException(['email email is wrong']);
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException(['email account is already confirmed']);
    }

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
    if (!user) {
      throw new BadRequestException(['recoveryCode code is wrong']);
    }
    if (
      user.passwordRecoveryConfirmation.passwordRecoveryCode !== recoveryCode
    ) {
      throw new BadRequestException(['recoveryCode code is wrong']);
    }
    if (user.passwordRecoveryConfirmation.isConfirmed) {
      throw new BadRequestException([
        'recoveryCode Password is already changed'
      ]);
    }
    if (user.passwordRecoveryConfirmation.expirationDate < new Date()) {
      throw new BadRequestException(['recoveryCode code is expired']);
    }
    user.updatePassword(newPassword);
    await this.usersRepository.save(user);
    return true;
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { InputLoginUserDto } from './dto/input.login.user.dto';
import * as bcrypt from 'bcrypt';
import { Token, TokenPayloadType } from '../infrastructure/types/jwt.type';
import { IJwtService } from '../infrastructure/jwt/jwt.service';
import { SessionsService } from '../sessions/sessions.service';
import { InputRegistrationUserDto } from './dto/input.registration.user.dto';
import { DbId } from '../types/types';
import { InjectModel } from '@nestjs/mongoose';
import { IUserModel, User } from '../users/entities/user.entity';
import { EmailManager } from '../infrastructure/email/email.manager';
import { InputConfirmationCodeDto } from './dto/input.confirmation.code.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: IJwtService,
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

    user.updateEmailConfirmationStatus(confirmationCodeDto.code);
    await this.usersRepository.save(user);
    return true;
  }
}

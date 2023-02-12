import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UnauthorizedException,
  Headers,
  Res,
  Get,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { InputLoginUserDto } from './dto/input.login.user.dto';
import { UsersService } from '../users/users.service';
import { JwtAdapter } from '../adapters/jwt/jwt.service';
import { v4 } from 'uuid';
import { SessionsService } from '../sessions/sessions.service';
import { OutputAccessTokenDto } from './dto/output.token.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../configuration/configuration';
import { Throttle } from '@nestjs/throttler';
import { Cookies } from '../helper/get-decorators/cookie.decorator';
import { UsersQueryRepository } from '../users/users.query.repository';
import { OutputUserMeDto } from './dto/output.user.me.dto';
import { InputRegistrationUserDto } from './dto/input.registration.user.dto';
import { InputConfirmationCodeDto } from './dto/input.confirmation.code.dto';
import { InputEmailDto } from './dto/input.email.dto';
import { InputRecoveryEmailDto } from './dto/input.recovery.email.dto';
import { InputNewPasswordDto } from './dto/input.newpassword.dto';
import { CurrentUser } from '../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from './types/current.user.type';
import { Types } from 'mongoose';
import { JwtAuthGuard } from './guards/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationUserCommand } from './use-cases/registration.user.use.case';
import { ConfirmEmailCommand } from './use-cases/confirm.email.use.case';

const limit = 5;
const ttl = 10;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtAdapter: JwtAdapter,
    private readonly sessionsService: SessionsService,
    private readonly configService: ConfigService<IConfigType>,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @Throttle(limit, ttl)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginUserDto: InputLoginUserDto,
    @Ip() ip: string,
    @Headers('user-agent')
    deviceName: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<OutputAccessTokenDto> {
    const userId = await this.authService.validateUser(loginUserDto);
    if (!userId) {
      response.clearCookie('refreshToken');
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = await this.jwtAdapter.getTokens(
      userId.toString(),
      v4()
    );

    await this.sessionsService.create(refreshToken, ip, deviceName);
    const cookieMode = this.configService.get('SECURE_COOKIE_MODE') == 'true';
    await response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: cookieMode
    });
    return { accessToken: accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(
    @Cookies('refreshToken') gotRefreshToken: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<OutputAccessTokenDto> {
    const payload = await this.authService.checkAuthorizationAndGetPayload(
      gotRefreshToken
    );
    if (!payload) {
      response.clearCookie('refreshToken');
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = await this.jwtAdapter.getTokens(
      payload.userId,
      payload.deviceId
    );
    await this.sessionsService.update(refreshToken);
    const cookieMode = this.configService.get('SECURE_COOKIE_MODE') == 'true';
    await response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: cookieMode
    });
    return { accessToken: accessToken };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Cookies('refreshToken') gotRefreshToken: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const payload = await this.authService.checkAuthorizationAndGetPayload(
      gotRefreshToken
    );
    if (!payload) {
      response.clearCookie('refreshToken');
      throw new UnauthorizedException();
    }
    await this.sessionsService.deleteSession(payload.iat);
    response.clearCookie('refreshToken');
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async me(@CurrentUser() user: CurrentUserType): Promise<OutputUserMeDto> {
    return await this.usersQueryRepository.getMeById(
      new Types.ObjectId(user.userId)
    );
  }

  @Throttle(limit, ttl)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() registrationUserDto: InputRegistrationUserDto) {
    await this.commandBus.execute(
      new RegistrationUserCommand(registrationUserDto)
    );
    return;
  }

  @Throttle(limit, ttl)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(
    @Body() confirmationCodeDto: InputConfirmationCodeDto
  ) {
    await this.commandBus.execute(new ConfirmEmailCommand(confirmationCodeDto));
    return;
  }

  @Throttle(limit, ttl)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() emailDto: InputEmailDto) {
    await this.authService.resendEmail(emailDto);
    return;
  }

  @Throttle(limit, ttl)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async passwordRecovery(@Body() recoveryEmailDto: InputRecoveryEmailDto) {
    await this.authService.recoveryPassword(recoveryEmailDto);
    return;
  }

  @Throttle(limit, ttl)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async newPassword(@Body() newPasswordDto: InputNewPasswordDto) {
    await this.authService.setNewPassword(newPasswordDto);
    return;
  }
}

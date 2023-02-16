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
import { InputLoginUserDto } from './dto/input.login.user.dto';
import { JwtAdapter } from '../../adapters/jwt/jwt.service';
import { v4 } from 'uuid';
import { OutputAccessTokenDto } from './dto/output.token.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../configuration/configuration';
import { Throttle } from '@nestjs/throttler';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { OutputUserMeDto } from './dto/output.user.me.dto';
import { InputRegistrationUserDto } from './dto/input.registration.user.dto';
import { InputConfirmationCodeDto } from './dto/input.confirmation.code.dto';
import { InputEmailDto } from './dto/input.email.dto';
import { InputRecoveryEmailDto } from './dto/input.recovery.email.dto';
import { InputNewPasswordDto } from './dto/input.newpassword.dto';
import { CurrentUser } from '../../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from './types/current.user.type';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../infrastructure/guards/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationUserCommand } from '../application/use-cases/registration.user.use.case';
import { ConfirmEmailCommand } from '../application/use-cases/confirm.email.use.case';
import { ValidateUserInLoginCommand } from '../application/use-cases/validate.user.in.login.use.case';
import { CookieGuard } from '../infrastructure/guards/cookie.guard';
import { RefreshTokenPayloadType } from '../../adapters/jwt/types/jwt.type';
import { PayloadFromRefreshToke } from '../../helper/get-decorators/payload.decorator';
import { ResendEmailConfirmationCommand } from '../application/use-cases/resend.email.confirmation.use.case';
import { RecoveryPasswordCommand } from '../application/use-cases/recovery.password.use.case';
import { SetNewPasswordCommand } from '../application/use-cases/set.new.password.use.case';
import { CreateSessionCommand } from '../../sessions/application/use-cases/create.session.use.case';
import { UpdateSessionCommand } from '../../sessions/application/use-cases/update.session.use.case';
import { RemoveSessionCommand } from '../../sessions/application/use-cases/remove.session.use.case';

const limit = 5;
const ttl = 10;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtAdapter: JwtAdapter,
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
    const userId = await this.commandBus.execute(
      new ValidateUserInLoginCommand(loginUserDto)
    );
    if (!userId) {
      response.clearCookie('refreshToken');
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = await this.jwtAdapter.getTokens(
      userId.toString(),
      v4()
    );

    await this.commandBus.execute(
      new CreateSessionCommand(refreshToken, ip, deviceName)
    );
    const cookieMode = this.configService.get('SECURE_COOKIE_MODE') == 'true';
    await response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: cookieMode
    });
    return { accessToken: accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(CookieGuard)
  @Post('refresh-token')
  async refreshToken(
    @PayloadFromRefreshToke() payload: RefreshTokenPayloadType,
    @Res({ passthrough: true }) response: Response
  ): Promise<OutputAccessTokenDto> {
    const { accessToken, refreshToken } = await this.jwtAdapter.getTokens(
      payload.userId,
      payload.deviceId
    );
    await this.commandBus.execute(new UpdateSessionCommand(refreshToken));
    const cookieMode = this.configService.get('SECURE_COOKIE_MODE') == 'true';
    await response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: cookieMode
    });
    return { accessToken: accessToken };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookieGuard)
  @Post('logout')
  async logout(
    @PayloadFromRefreshToke() payload: RefreshTokenPayloadType,
    @Res({ passthrough: true }) response: Response
  ) {
    await this.commandBus.execute(new RemoveSessionCommand(payload.iat));
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
    await this.commandBus.execute(new ResendEmailConfirmationCommand(emailDto));
    return;
  }

  @Throttle(limit, ttl)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async passwordRecovery(@Body() recoveryEmailDto: InputRecoveryEmailDto) {
    await this.commandBus.execute(
      new RecoveryPasswordCommand(recoveryEmailDto)
    );
    return;
  }

  @Throttle(limit, ttl)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async newPassword(@Body() newPasswordDto: InputNewPasswordDto) {
    await this.commandBus.execute(new SetNewPasswordCommand(newPasswordDto));
    return;
  }
}

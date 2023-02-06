import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UnauthorizedException,
  Headers,
  Res
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { InputLoginUserDto } from './dto/input.login.user.dto';
import { UsersService } from '../users/users.service';
import { IJwtService } from '../infrastructure/jwt/jwt.service';
import { v4 } from 'uuid';
import { SessionsService } from '../sessions/sessions.service';
import { OutputAccessTokenDto } from './dto/output.token.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../configuration/configuration';
import { Throttle } from '@nestjs/throttler';
import { Cookies } from '../helper/decorators/cookie.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: IJwtService,
    private readonly sessionsService: SessionsService,
    private readonly configService: ConfigService<IConfigType>
  ) {}

  @Throttle(5, 10)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginUserDto: InputLoginUserDto,
    @Ip() ip: string,
    @Headers('user-agent') deviceName: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<OutputAccessTokenDto> {
    const userId = await this.authService.checkCredentials(loginUserDto);
    if (!userId) {
      response.clearCookie('refreshToken');
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = await this.jwtService.getTokens(
      userId,
      v4()
    );

    await this.sessionsService.saveSession(refreshToken, ip, deviceName);
    const cookieMode = this.configService.get('SECURE_COOKIE_MODE') == true;
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
    const { accessToken, refreshToken } = await this.jwtService.getTokens(
      payload.userId,
      payload.deviceId
    );
    await this.sessionsService.updateSession(refreshToken);
    const cookieMode = this.configService.get('SECURE_COOKIE_MODE') == true;
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
}

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UnauthorizedException,
  Headers
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { InputLoginUserDto } from './dto/input.login.user.dto';
import { UsersService } from '../users/users.service';
import { IJwtService } from '../infrastructure/jwt/jwt.service';
import { v4 } from 'uuid';
import { SessionsService } from '../sessions/sessions.service';
import { OutputAccessTokenDto } from './dto/output.token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: IJwtService,
    private readonly sessionsService: SessionsService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginUserDto: InputLoginUserDto,
    @Ip() ip,
    @Headers('user-agent') deviceName
  ): Promise<OutputAccessTokenDto> {
    const userId = await this.authService.checkCredentials(loginUserDto);
    if (!userId) {
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = await this.jwtService.getTokens(
      userId,
      v4()
    );
    await this.sessionsService.saveSession(refreshToken, ip, deviceName);
    return { accessToken: accessToken };
  }
}

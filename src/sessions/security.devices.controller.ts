import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UnauthorizedException
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Cookies } from '../helper/get-decorators/cookie.decorator';
import { AuthService } from '../auth/auth.service';
import { SessionsQueryRepository } from './sessions.query.repository';
import { OutputSessionDto } from './dto/output.session.dto';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly authService: AuthService,
    private readonly sessionsQueryRepository: SessionsQueryRepository
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllActiveSession(
    @Cookies('refreshToken') gotRefreshToken: string
  ): Promise<OutputSessionDto[]> {
    const payload = await this.authService.checkAuthorizationAndGetPayload(
      gotRefreshToken
    );
    if (!payload) {
      throw new UnauthorizedException();
    }
    return await this.sessionsQueryRepository.findAllActiveSession(
      payload.userId
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async deleteAllSessionWithoutCurrent(
    @Cookies('refreshToken') gotRefreshToken: string
  ) {
    const payload = await this.authService.checkAuthorizationAndGetPayload(
      gotRefreshToken
    );
    if (!payload) {
      throw new UnauthorizedException();
    }
    await this.sessionsService.deleteActiveSessionWithoutCurrent(
      payload.userId,
      payload.iat
    );
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteSessionById(
    @Param('id') id: string,
    @Cookies('refreshToken') gotRefreshToken: string
  ) {
    const payload = await this.authService.checkAuthorizationAndGetPayload(
      gotRefreshToken
    );
    if (!payload) {
      throw new UnauthorizedException();
    }
    await this.sessionsService.deleteSessionByDeviceId(id, payload.userId);
    return;
  }
}

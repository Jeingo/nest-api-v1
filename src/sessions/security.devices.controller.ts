import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsQueryRepository } from './sessions.query.repository';
import { OutputSessionDto } from './dto/output.session.dto';
import { CookieGuard } from '../auth/guards/cookie.guard';
import { PayloadFromRefreshToke } from '../helper/get-decorators/payload.decorator';
import { RefreshTokenPayloadType } from '../adapters/jwt/types/jwt.type';
import { CommandBus } from '@nestjs/cqrs';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly sessionsQueryRepository: SessionsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(CookieGuard)
  @Get()
  async getAllActiveSession(
    @PayloadFromRefreshToke() payload: RefreshTokenPayloadType
  ): Promise<OutputSessionDto[]> {
    return await this.sessionsQueryRepository.findAllActiveSession(
      payload.userId
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookieGuard)
  @Delete()
  async deleteAllSessionWithoutCurrent(
    @PayloadFromRefreshToke() payload: RefreshTokenPayloadType
  ) {
    await this.sessionsService.deleteActiveSessionWithoutCurrent(
      payload.userId,
      payload.iat
    );
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CookieGuard)
  @Delete(':id')
  async deleteSessionById(
    @Param('id') id: string,
    @PayloadFromRefreshToke() payload: RefreshTokenPayloadType
  ) {
    await this.sessionsService.deleteSessionByDeviceId(id, payload.userId);
    return;
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { IJwtService } from '../../infrastructure/jwt/jwt.service';
import { UsersRepository } from '../../users/users.repository';
import { Types } from 'mongoose';

@Injectable()
export class BearerGuard implements CanActivate {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly usersRepository: UsersRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException();
    }

    const authorizationField = authorization.split(' ');
    if (authorizationField[0] !== 'Bearer') {
      throw new UnauthorizedException();
    }
    const checkResult = this.jwtService.checkExpirationAccessToken(
      authorizationField[1]
    );
    if (!checkResult) {
      throw new UnauthorizedException();
    }
    const payload = this.jwtService.getPayload(authorizationField[1]);
    if (!payload) {
      throw new UnauthorizedException();
    }
    const user = await this.usersRepository.getById(
      new Types.ObjectId(payload.userId)
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    request.user = user;
    return true;
  }
}

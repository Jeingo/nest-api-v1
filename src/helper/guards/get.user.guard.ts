import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IJwtService } from '../../infrastructure/jwt/jwt.service';
import { UsersRepository } from '../../users/users.repository';
import { Types } from 'mongoose';

@Injectable()
export class GetUserGuard implements CanActivate {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly usersRepository: UsersRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) {
      return true;
    }

    const authorizationField = authorization.split(' ');
    if (authorizationField[0] !== 'Bearer') {
      return true;
    }

    const payload = this.jwtService.getPayload(authorizationField[1]);
    if (!payload) {
      return true;
    }
    request.user = await this.usersRepository.getById(
      new Types.ObjectId(payload.userId)
    );
    return true;
  }
}

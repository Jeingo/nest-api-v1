import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies?.refreshToken;
    const payload = await this.authService.checkAuthorizationAndGetPayload(
      refreshToken
    );
    if (!payload) {
      throw new UnauthorizedException();
    }
    request.payload = payload;
    return true;
  }
}

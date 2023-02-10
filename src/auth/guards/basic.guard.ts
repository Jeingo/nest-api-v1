import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from '../../configuration/configuration';

@Injectable()
export class BasicGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<IConfigType>) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException();
    }
    const authorizationField = authorization.split(' ');

    const login = this.configService.get('BASIC_AUTH_LOGIN');
    const password = this.configService.get('BASIC_AUTH_PASSWORD');
    const secret = this._encodeBase64(login, password);

    if (authorizationField[0] !== 'Basic' || authorizationField[1] !== secret) {
      throw new UnauthorizedException();
    }
    return true;
  }
  private _encodeBase64(login: string, password: string): string {
    const encoded = `${login}:${password}`;
    return Buffer.from(encoded).toString('base64');
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from './configuration/configuration';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './helper/expceptionFilter/exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<IConfigType>);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.use(cookieParser());
  await app.listen(configService.get('PORT'));
}
bootstrap();

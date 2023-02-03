import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IConfigType } from './configuration/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<IConfigType>);
  app.enableCors();
  await app.listen(configService.get('PORT'));
}
bootstrap();

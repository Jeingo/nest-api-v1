import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { settings } from './settings/settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(settings.PORT);
}
bootstrap();

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { settings } from './settings/settings';
import { BlogsModule } from './blogs/blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(settings.MONGO_URL, {
      dbName: settings.DB_NAME,
    }),
    BlogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

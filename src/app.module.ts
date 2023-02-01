import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { settings } from './settings/settings';
import { BlogsModule } from './blogs/blogs.module';
import { TestingModule } from './testing/testing.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(settings.MONGO_URL, {
      dbName: settings.DB_NAME,
    }),
    BlogsModule,
    TestingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

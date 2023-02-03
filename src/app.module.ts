import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlogsModule } from './blogs/blogs.module';
import { TestingModule } from './testing/testing.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import configuration from './configuration/configuration';
import { IConfigType } from './configuration/configuration';

const configService = new ConfigService<IConfigType>();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    MongooseModule.forRoot(configService.get('MONGO_URL'), {
      dbName: configService.get('DB_NAME')
    }),
    BlogsModule,
    TestingModule,
    PostsModule,
    CommentsModule,
    UsersModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}

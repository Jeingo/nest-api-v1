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
import { AuthModule } from './auth/auth.module';
import { InfrastructureModule } from './infrastructure/infrastructureModule';
import { SessionsModule } from './sessions/sessions.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

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
    // ThrottlerModule.forRoot(),
    BlogsModule,
    TestingModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    AuthModule,
    InfrastructureModule,
    SessionsModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}

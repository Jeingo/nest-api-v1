import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration/configuration';
import { IConfigType } from './configuration/configuration';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Blog, BlogSchema } from './blogs/entities/blog.entity';
import { Post, PostSchema } from './posts/entities/post.entity';
import { User, UserSchema } from './users/entities/user.entity';
import { Comment, CommentSchema } from './comments/entities/comment.entity';
import { Session, SessionSchema } from './sessions/entities/session.entity';
import {
  PostLike,
  PostLikeSchema
} from './post-likes/entities/post.like.entity';
import {
  CommentLike,
  CommentLikeSchema
} from './comment-likes/entities/comment.like.entity';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersRepository } from './users/users.repository';
import { UsersService } from './users/users.service';
import { JwtAdapter } from './adapters/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from './sessions/sessions.service';
import { SessionsRepository } from './sessions/sessions.repository';
import { UsersQueryRepository } from './users/users.query.repository';
import { EmailManager } from './adapters/email/email.manager';
import { EmailService } from './adapters/email/email.service';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsQueryRepository } from './blogs/blogs.query.repository';
import { BlogsRepository } from './blogs/blogs.repository';
import { PostsQueryRepository } from './posts/posts.query.repository';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { PostLikesRepository } from './post-likes/post.likes.repository';
import { CommentLikesRepository } from './comment-likes/comment.likes.repository';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { CommentsQueryRepository } from './comments/comments.query.repository';
import { CommentsRepository } from './comments/comments.repository';
import { PostsController } from './posts/posts.controller';
import { IsBlogIdConstraint } from './helper/validation-decorators/is.blog.id.decorator';
import { SecurityDevicesController } from './sessions/security.devices.controller';
import { SessionsQueryRepository } from './sessions/sessions.query.repository';
import { TestingController } from './testing/testing.controller';
import { TestingService } from './testing/testing.service';
import { UsersController } from './users/users.controller';
import { CheckIdAndParseToDBId } from './helper/pipes/check.id.validator.pipe';
import { EmailNotExistConstraint } from './helper/validation-decorators/email.not.exist.decorator';
import { LoginExistConstraint } from './helper/validation-decorators/login.exist.decorator';
import { EmailConfirmationCodeIsCorrectConstraint } from './helper/validation-decorators/email.confirmation.code.is.correct.decorator';
import { EmailExistAndDontConfirmedConstraint } from './helper/validation-decorators/email.exist.and.dont.confirmed.decorator';
import { PasswordRecoveryCodeIsCorrectConstraint } from './helper/validation-decorators/password.recover.code.is.correct.decorator';

const configService = new ConfigService<IConfigType>();

const providers = [
  AuthService,
  UsersService,
  JwtAdapter,
  JwtService,
  SessionsService,
  SessionsRepository,
  ConfigService,
  UsersQueryRepository,
  EmailManager,
  EmailService,
  BlogsService,
  BlogsQueryRepository,
  BlogsRepository,
  PostsQueryRepository,
  PostsService,
  PostsRepository,
  UsersRepository,
  PostLikesRepository,
  CommentsService,
  CommentsQueryRepository,
  CommentsRepository,
  CommentLikesRepository,
  IsBlogIdConstraint,
  EmailNotExistConstraint,
  EmailExistAndDontConfirmedConstraint,
  LoginExistConstraint,
  EmailConfirmationCodeIsCorrectConstraint,
  PasswordRecoveryCodeIsCorrectConstraint,
  SessionsQueryRepository,
  TestingService,
  CheckIdAndParseToDBId
];
const controllers = [
  AuthController,
  BlogsController,
  CommentsController,
  PostsController,
  SecurityDevicesController,
  TestingController,
  UsersController
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    MongooseModule.forRoot(configService.get('MONGO_URL'), {
      dbName: configService.get('DB_NAME')
    }),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Session.name, schema: SessionSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: CommentLike.name, schema: CommentLikeSchema }
    ]),
    ThrottlerModule.forRoot()
  ],
  controllers: [...controllers],
  providers: [
    ...providers,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}

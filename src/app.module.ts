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
import { BlogsQueryRepository } from './blogs/blogs.query.repository';
import { BlogsRepository } from './blogs/blogs.repository';
import { PostsQueryRepository } from './posts/posts.query.repository';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { PostLikesRepository } from './post-likes/post.likes.repository';
import { CommentLikesRepository } from './comment-likes/comment.likes.repository';
import { CommentsController } from './comments/comments.controller';
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
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUserUseCase } from './auth/use-cases/registration.user.use.case';
import { ConfirmEmailUseCase } from './auth/use-cases/confirm.email.use.case';
import { ValidateUserInLoginUseCase } from './auth/use-cases/validate.user.in.login.use.case';
import { ResendEmailConfirmationUseCase } from './auth/use-cases/resend.email.confirmation.use.case';
import { RecoveryPasswordUseCase } from './auth/use-cases/recovery.password.use.case';
import { SetNewPasswordUseCase } from './auth/use-cases/set.new.password.use.case';
import { CreateBlogUseCase } from './blogs/use-cases/create.blog.use.case';
import { UpdateBlogUseCase } from './blogs/use-cases/update.blog.use.case';
import { RemoveBlogUseCase } from './blogs/use-cases/remove.blog.use.case';
import { CreateCommentUseCase } from './comments/use.cases/create.comment.use.case';
import { UpdateCommentUseCase } from './comments/use.cases/update.comment.use.case';
import { RemoveCommentUseCase } from './comments/use.cases/remove.comment.use.case';
import { UpdateLikeStatusInCommentUseCase } from './comments/use.cases/update.status.like.in.comment.use.case';
import { CreatePostUseCase } from './posts/use-cases/create.post.use.case';
import { CreatePostInBlogUseCase } from './posts/use-cases/create.post.in.blog.use.case';
import { UpdatePostUseCase } from './posts/use-cases/update.post.use.case';

const configService = new ConfigService<IConfigType>();

const useCases = [
  RegistrationUserUseCase,
  ConfirmEmailUseCase,
  ValidateUserInLoginUseCase,
  ResendEmailConfirmationUseCase,
  RecoveryPasswordUseCase,
  SetNewPasswordUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  RemoveBlogUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  RemoveCommentUseCase,
  UpdateLikeStatusInCommentUseCase,
  CreatePostUseCase,
  CreatePostInBlogUseCase,
  UpdatePostUseCase
];
const services = [
  UsersService,
  JwtAdapter,
  JwtService,
  SessionsService,
  ConfigService,
  EmailManager,
  EmailService,
  PostsService,
  TestingService
];
const repositories = [
  SessionsRepository,
  BlogsRepository,
  PostsRepository,
  UsersRepository,
  PostLikesRepository,
  CommentsRepository,
  CommentLikesRepository
];
const queryRepositories = [
  UsersQueryRepository,
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
  SessionsQueryRepository
];
const decorators = [
  IsBlogIdConstraint,
  EmailNotExistConstraint,
  EmailExistAndDontConfirmedConstraint,
  LoginExistConstraint,
  EmailConfirmationCodeIsCorrectConstraint,
  PasswordRecoveryCodeIsCorrectConstraint,
  CheckIdAndParseToDBId
];
const strategies = [JwtStrategy, BasicStrategy];

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
    ThrottlerModule.forRoot(),
    PassportModule,
    CqrsModule
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...repositories,
    ...queryRepositories,
    ...decorators,
    ...strategies,
    ...useCases,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}

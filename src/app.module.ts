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
import { JwtAdapter } from './adapters/jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsRepository } from './sessions/sessions.repository';
import { UsersQueryRepository } from './auth/users.query.repository';
import { EmailManager } from './adapters/email/email.manager';
import { EmailService } from './adapters/email/email.service';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsQueryRepository } from './blogs/blogs.query.repository';
import { BlogsRepository } from './blogs/blogs.repository';
import { PostsQueryRepository } from './posts/posts.query.repository';
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
import { CreateBlogUseCase } from './blogger/blogs/use-cases/create.blog.use.case';
import { UpdateBlogUseCase } from './blogger/blogs/use-cases/update.blog.use.case';
import { RemoveBlogUseCase } from './blogger/blogs/use-cases/remove.blog.use.case';
import { CreateCommentUseCase } from './comments/use.cases/create.comment.use.case';
import { UpdateCommentUseCase } from './comments/use.cases/update.comment.use.case';
import { RemoveCommentUseCase } from './comments/use.cases/remove.comment.use.case';
import { UpdateLikeStatusInCommentUseCase } from './comments/use.cases/update.status.like.in.comment.use.case';
import { CreatePostInBlogUseCase } from './blogger/blogs/use-cases/create.post.in.blog.use.case';
import { UpdatePostUseCase } from './blogger/blogs/use-cases/update.post.use.case';
import { RemovePostUseCase } from './blogger/blogs/use-cases/remove.post.use.case';
import { UpdateStatusLikeInPostUseCase } from './posts/use-cases/update.status.like.in.post.use.case';
import { CreateUserUseCase } from './superadmin/users/use-cases/create.user.use.case';
import { RemoveUserUseCase } from './superadmin/users/use-cases/remove.user.use.case';
import { CreateSessionUseCase } from './sessions/use-cases/create.session.use.case';
import { UpdateSessionUseCase } from './sessions/use-cases/update.session.use.case';
import { RemoveSessionUseCase } from './sessions/use-cases/remove.session.use.case';
import { RemoveSessionWithoutCurrentUseCase } from './sessions/use-cases/remove.sessions.without.current.use.case';
import { RemoveSessionByDeviceIdUseCase } from './sessions/use-cases/remove.session.by.device.id.use.case';
import { BloggerBlogsController } from './blogger/blogs/blogger.blogs.controller';
import { SuperAdminBlogsController } from './superadmin/blogs/superadmin.blogs.controller';
import { SuperAdminUsersController } from './superadmin/users/superadmin.users.controller';
import { BloggerBlogsQueryRepository } from './blogger/blogs/blogger.blogs.query.repository';
import { SuperAdminUsersQueryRepository } from './superadmin/users/superadmin.users.query.repository';

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
  CreatePostInBlogUseCase,
  UpdatePostUseCase,
  RemovePostUseCase,
  UpdateStatusLikeInPostUseCase,
  CreateUserUseCase,
  RemoveUserUseCase,
  CreateUserUseCase,
  CreateSessionUseCase,
  UpdateSessionUseCase,
  RemoveSessionUseCase,
  RemoveSessionWithoutCurrentUseCase,
  RemoveSessionByDeviceIdUseCase
];
const services = [
  JwtAdapter,
  JwtService,
  ConfigService,
  EmailManager,
  EmailService,
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
  SessionsQueryRepository,
  BloggerBlogsQueryRepository,
  SuperAdminUsersQueryRepository
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
  BloggerBlogsController,
  SuperAdminBlogsController,
  SuperAdminUsersController
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
    ...useCases
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard
    // }
  ]
})
export class AppModule {}

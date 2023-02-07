import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './entities/comment.entity';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsRepository } from './comments.repository';
import { Post, PostSchema } from '../posts/entities/post.entity';
import { PostsRepository } from '../posts/posts.repository';
import {
  CommentLike,
  CommentLikeSchema
} from '../comment-likes/entities/comment.like.entity';
import { CommentLikesRepository } from '../comment-likes/comment.likes.repository';
import { CommentLikesQueryRepository } from '../comment-likes/comment.like.query.repository';
import { IJwtService } from '../infrastructure/jwt/jwt.service';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsQueryRepository,
    CommentsRepository,
    PostsRepository,
    CommentLikesRepository,
    CommentLikesQueryRepository,
    IJwtService,
    UsersRepository,
    JwtService
  ]
})
export class CommentsModule {}

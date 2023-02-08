import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsRepository } from './posts.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.entity';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Blog, BlogSchema } from '../blogs/entities/blog.entity';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { Comment, CommentSchema } from '../comments/entities/comment.entity';
import {
  PostLike,
  PostLikeSchema
} from '../post-likes/entities/post.like.entity';
import { PostLikesQueryRepository } from '../post-likes/post.likes.query.repository';
import { PostLikesRepository } from '../post-likes/post.likes.repository';
import { CommentLikesQueryRepository } from '../comment-likes/comment.like.query.repository';
import {
  CommentLike,
  CommentLikeSchema
} from '../comment-likes/entities/comment.like.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { IJwtService } from '../infrastructure/jwt/jwt.service';
import { UsersRepository } from '../users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { CommentsService } from '../comments/comments.service';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentLikesRepository } from '../comment-likes/comment.likes.repository';
import { IsBlogIdConstraint } from './blogId.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsQueryRepository,
    PostsRepository,
    BlogsRepository,
    CommentsQueryRepository,
    PostLikesQueryRepository,
    PostLikesRepository,
    CommentLikesQueryRepository,
    IJwtService,
    UsersRepository,
    JwtService,
    CommentsService,
    CommentsRepository,
    CommentLikesRepository,
    IsBlogIdConstraint
  ]
})
export class PostsModule {}

import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './entities/blog.entity';
import { BlogsQueryRepository } from './blogs.query.repository';
import { BlogsRepository } from './blogs.repository';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PostsService } from '../posts/posts.service';
import { Post, PostSchema } from '../posts/entities/post.entity';
import { PostsRepository } from '../posts/posts.repository';
import { IJwtService } from '../infrastructure/jwt/jwt.service';
import { UsersRepository } from '../users/users.repository';
import { User, UserSchema } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { PostLikesQueryRepository } from '../post-likes/post.likes.query.repository';
import {
  PostLike,
  PostLikeSchema
} from '../post-likes/entities/post.like.entity';
import { PostLikesRepository } from '../post-likes/post.likes.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: PostLike.name, schema: PostLikeSchema }
    ])
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsQueryRepository,
    BlogsRepository,
    PostsQueryRepository,
    PostsService,
    PostsRepository,
    IJwtService,
    UsersRepository,
    JwtService,
    PostLikesQueryRepository,
    PostLikesRepository
  ]
})
export class BlogsModule {}

import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../blogs/entities/blog.entity';
import { Post, PostSchema } from '../posts/entities/post.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { Comment, CommentSchema } from '../comments/entities/comment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema }
    ])
  ],
  controllers: [TestingController],
  providers: [TestingService]
})
export class TestingModule {}

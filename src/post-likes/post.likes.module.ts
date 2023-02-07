import { Module } from '@nestjs/common';
import { PostLikesService } from './post.likes.service';
import { PostLikesRepository } from './post.likes.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { PostLike, PostLikeSchema } from './entities/post.like.entity';
import { PostLikesQueryRepository } from './post.likes.query.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PostLike.name, schema: PostLikeSchema }])
  ],
  providers: [PostLikesService, PostLikesRepository, PostLikesQueryRepository]
})
export class PostLikesModule {}

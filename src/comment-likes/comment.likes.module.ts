import { Module } from '@nestjs/common';
import { CommentLikesQueryRepository } from './comment.like.query.repository';
import { CommentLikesRepository } from './comment.likes.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentLike, CommentLikeSchema } from './entities/comment.like.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommentLike.name, schema: CommentLikeSchema }
    ])
  ],
  providers: [CommentLikesQueryRepository, CommentLikesRepository]
})
export class CommentLikesModule {}
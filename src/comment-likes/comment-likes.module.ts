import { Module } from '@nestjs/common';
import { CommentLikesService } from './comment-likes.service';

@Module({
  providers: [CommentLikesService]
})
export class CommentLikesModule {}

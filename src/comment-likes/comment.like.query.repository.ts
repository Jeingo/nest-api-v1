import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeDocument,
  ICommentLikeModel
} from './entities/comment.like.entity';
import { OutputCommentLikeDto } from '../comments/dto/output.comment.like.dto';

@Injectable()
export class CommentLikesQueryRepository {
  constructor(
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel
  ) {}

  async getLike(
    userId: string,
    commentId: string
  ): Promise<OutputCommentLikeDto | null> {
    const result = await this.commentLikesModel.findOne({
      userId: userId,
      commentId: commentId
    });
    if (!result) return null;
    return this._getOutputLike(result);
  }
  private _getOutputLike(like: CommentLikeDocument): OutputCommentLikeDto {
    return {
      id: like._id.toString(),
      userId: like.userId,
      commentId: like.commentId,
      myStatus: like.myStatus
    };
  }
}

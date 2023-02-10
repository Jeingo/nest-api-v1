import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbId, LikeStatus } from '../types/types';
import {
  CommentDocument,
  ICommentModel,
  Comment
} from './entities/comment.entity';
import { getUpdatedLike } from '../helper/query/post.like.repository.helper';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: ICommentModel
  ) {}
  async getById(id: DbId): Promise<CommentDocument> {
    return this.commentsModel.findById(id);
  }
  async save(comment: CommentDocument): Promise<CommentDocument> {
    return await comment.save();
  }
  async delete(id: DbId): Promise<CommentDocument> {
    return this.commentsModel.findByIdAndDelete(id);
  }
  async updateLikeInComment(
    comment: CommentDocument,
    lastStatus: LikeStatus,
    newStatus: LikeStatus
  ): Promise<boolean> {
    const newLikesInfo = getUpdatedLike(
      {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount
      },
      lastStatus,
      newStatus
    );
    const result = await this.commentsModel.findByIdAndUpdate(comment._id, {
      likesInfo: newLikesInfo
    });
    return !!result;
  }
}

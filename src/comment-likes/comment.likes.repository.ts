import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbId } from '../types/types';
import {
  CommentLike,
  CommentLikeDocument,
  ICommentLikeModel
} from './entities/comment.like.entity';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel
  ) {}
  async getById(id: DbId): Promise<CommentLikeDocument> {
    return this.commentLikesModel.findById(id);
  }
  async save(commentLike: CommentLikeDocument): Promise<CommentLikeDocument> {
    return await commentLike.save();
  }
}

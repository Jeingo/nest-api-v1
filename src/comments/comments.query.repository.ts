import { Injectable, NotFoundException } from '@nestjs/common';
import { DbId } from '../types/types';
import { OutputCommentDto } from './dto/output.comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  ICommentModel
} from './entities/comment.entity';
import { QueryComments } from './types/comments.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import { Types } from 'mongoose';
import { PostsRepository } from '../posts/posts.repository';
import {
  getPaginatedType,
  makeDirectionToNumber
} from '../helper/query/query.repository.helper';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    private readonly postsRepository: PostsRepository
  ) {}

  async getAllByPostId(
    query: QueryComments,
    postId: string
  ): Promise<PaginatedType<OutputCommentDto>> {
    const post = await this.postsRepository.getById(new Types.ObjectId(postId));
    if (!post) throw new NotFoundException();
    const {
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;
    const countAllDocuments = await this.commentsModel.countDocuments({
      postId: postId
    });
    const result = await this.commentsModel
      .find({ postId: postId })
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);
    const mappedComments = result.map(this._getOutputComment);
    //TODO after like
    return getPaginatedType(
      mappedComments,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(id: DbId): Promise<OutputCommentDto> {
    const result = await this.commentsModel.findById(id);
    if (!result) throw new NotFoundException();
    //TODO after like
    return this._getOutputComment(result);
  }
  private _getOutputComment(comment: CommentDocument): OutputCommentDto {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: 'None'
      }
    };
  }
}

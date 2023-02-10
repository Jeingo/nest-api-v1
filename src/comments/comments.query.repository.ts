import { Injectable, NotFoundException } from '@nestjs/common';
import { DbId, Direction, LikeStatus } from '../types/types';
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
import { UserDocument } from '../users/entities/user.entity';
import { CommentLikesQueryRepository } from '../comment-likes/comment.like.query.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    private readonly postsRepository: PostsRepository,
    private readonly commentLikesQueryRepository: CommentLikesQueryRepository
  ) {}

  async getAllByPostId(
    query: QueryComments,
    postId: string,
    user?: UserDocument
  ): Promise<PaginatedType<OutputCommentDto>> {
    const post = await this.postsRepository.getById(new Types.ObjectId(postId));
    if (!post) throw new NotFoundException();
    const {
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
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
    const mappedCommentsWithStatusLike = await this._setStatusLike(
      mappedComments,
      user?._id.toString()
    );
    return getPaginatedType(
      mappedCommentsWithStatusLike,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(id: DbId, user?: UserDocument): Promise<OutputCommentDto> {
    const result = await this.commentsModel.findById(id);
    if (!result) throw new NotFoundException();
    const mappedResult = this._getOutputComment(result);
    if (user?._id && mappedResult) {
      const like = await this.commentLikesQueryRepository.getLike(
        user?._id.toString(),
        mappedResult.id
      );
      if (like) {
        mappedResult.likesInfo.myStatus = like.myStatus;
      }
    }
    return mappedResult;
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
        myStatus: LikeStatus.None
      }
    };
  }
  private async _setStatusLike(
    comments: Array<OutputCommentDto>,
    userId: string
  ) {
    if (!userId) return comments;
    for (let i = 0; i < comments.length; i++) {
      const like = await this.commentLikesQueryRepository.getLike(
        userId,
        comments[i].id
      );
      if (like) {
        comments[i].likesInfo.myStatus = like.myStatus;
      }
    }
    return comments;
  }
}

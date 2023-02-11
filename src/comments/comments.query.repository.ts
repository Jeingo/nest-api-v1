import { Injectable, NotFoundException } from '@nestjs/common';
import { DbId, Direction, LikeStatus } from '../global-types/global.types';
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
import { CurrentUserType } from '../auth/types/current.user.type';
import { CommentLikesRepository } from '../comment-likes/comment.likes.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    private readonly postsRepository: PostsRepository,
    private readonly commentLikesRepository: CommentLikesRepository
  ) {}

  async getAllByPostId(
    query: QueryComments,
    postId: string,
    user?: CurrentUserType
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
      user?.userId
    );
    return getPaginatedType(
      mappedCommentsWithStatusLike,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(id: DbId, user?: CurrentUserType): Promise<OutputCommentDto> {
    const result = await this.commentsModel.findById(id);
    if (!result) throw new NotFoundException();
    const mappedResult = this._getOutputComment(result);
    if (user?.userId && mappedResult) {
      const like = await this.commentLikesRepository.getByUserIdAndCommentId(
        user.userId,
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
      const like = await this.commentLikesRepository.getByUserIdAndCommentId(
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

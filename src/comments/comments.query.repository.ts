import { Injectable, NotFoundException } from '@nestjs/common';
import { DbId, Direction, LikeStatus } from '../global-types/global.types';
import { OutputCommentDto } from './dto/output.comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  ICommentModel
} from './entities/comment.entity';
import { QueryComments } from './types/query.comments.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import {
  getPaginatedType,
  makeDirectionToNumber
} from '../helper/query/query.repository.helper';
import { CurrentUserType } from '../auth/types/current.user.type';
import { IPostModel, Post } from '../posts/entities/post.entity';
import {
  CommentLike,
  ICommentLikeModel
} from '../comment-likes/entities/comment.like.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    @InjectModel(Post.name) private postsModel: IPostModel,
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel
  ) {}

  async getAllByPostId(
    query: QueryComments,
    postId: DbId,
    user?: CurrentUserType
  ): Promise<PaginatedType<OutputCommentDto>> {
    const post = await this.postsModel.findById(postId);
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
      postId: postId.toString()
    });
    const result = await this.commentsModel
      .find({ postId: postId.toString() })
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
      const like = await this.commentLikesModel.findOne({
        userId: user.userId,
        commentId: mappedResult.id
      });
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
      const like = await this.commentLikesModel.findOne({
        userId: userId,
        commentId: comments[i].id
      });
      if (like) {
        comments[i].likesInfo.myStatus = like.myStatus;
      }
    }
    return comments;
  }
}

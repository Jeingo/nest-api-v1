import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CommentLikesRepository } from '../comment-likes/comment.likes.repository';
import { CommentLikesQueryRepository } from '../comment-likes/comment.like.query.repository';
import { DbId, LikeStatus } from '../global-types/global.types';
import { InputCreateCommentDto } from './dto/input.create.comment.dto';
import { CommentsRepository } from './comments.repository';
import { Types } from 'mongoose';
import { PostsRepository } from '../posts/posts.repository';
import { CurrentUserType } from '../auth/types/current.user.type';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentLikesQueryRepository: CommentLikesQueryRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  async create(
    createCommentDto: InputCreateCommentDto,
    postId: string,
    user: CurrentUserType
  ): Promise<DbId> {
    const post = await this.postsRepository.getById(new Types.ObjectId(postId));
    if (!post) throw new NotFoundException();
    const createdComment = this.commentRepository.create(
      createCommentDto.content,
      user.userId,
      user.login,
      postId
    );
    await this.commentRepository.save(createdComment);
    return createdComment._id;
  }
  async update(
    id: DbId,
    createCommentDto: InputCreateCommentDto,
    user: CurrentUserType
  ): Promise<boolean> {
    const comment = await this.commentRepository.getById(id);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== user.userId)
      throw new ForbiddenException();
    comment.update(createCommentDto.content);
    await this.commentRepository.save(comment);
    return true;
  }
  async delete(id: DbId, user: CurrentUserType): Promise<boolean> {
    const comment = await this.commentRepository.getById(id);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== user.userId)
      throw new ForbiddenException();
    await this.commentRepository.delete(id);
    return true;
  }
  async updateStatusLike(
    user: CurrentUserType,
    commentId: string,
    newLikeStatus: LikeStatus
  ): Promise<boolean> {
    let lastLikeStatus: LikeStatus = LikeStatus.None;
    const comment = await this.commentRepository.getById(
      new Types.ObjectId(commentId)
    );
    if (!comment) throw new NotFoundException();
    const likeInfo = await this.commentLikesQueryRepository.getLike(
      user.userId,
      commentId
    );
    if (!likeInfo) {
      const newLike = await this.commentLikesRepository.create(
        user.userId,
        commentId,
        newLikeStatus
      );
      await this.commentLikesRepository.save(newLike);
    } else {
      const commentLike = await this.commentLikesRepository.getById(
        new Types.ObjectId(likeInfo.id)
      );
      commentLike.update(newLikeStatus);
      await this.commentLikesRepository.save(commentLike);
      lastLikeStatus = likeInfo.myStatus;
    }
    return await this.commentRepository.updateLikeInComment(
      comment,
      lastLikeStatus,
      newLikeStatus
    );
  }
}

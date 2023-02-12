import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CommentLikesRepository } from '../comment-likes/comment.likes.repository';
import { DbId, LikeStatus } from '../global-types/global.types';
import { InputCreateCommentDto } from './dto/input.create.comment.dto';
import { CommentsRepository } from './comments.repository';
import { Types } from 'mongoose';
import { PostsRepository } from '../posts/posts.repository';
import { CurrentUserType } from '../auth/types/current.user.type';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  async create(
    createCommentDto: InputCreateCommentDto,
    postId: DbId,
    user: CurrentUserType
  ): Promise<DbId> {
    const post = await this.postsRepository.getById(new Types.ObjectId(postId));
    if (!post) throw new NotFoundException();
    const createdComment = this.commentRepository.create(
      createCommentDto.content,
      user.userId,
      user.login,
      postId.toString()
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
    commentId: DbId,
    newLikeStatus: LikeStatus
  ): Promise<boolean> {
    let lastLikeStatus: LikeStatus = LikeStatus.None;

    const comment = await this.commentRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    let like = await this.commentLikesRepository.getByUserIdAndCommentId(
      user.userId,
      commentId.toString()
    );

    if (!like) {
      like = await this.commentLikesRepository.create(
        user.userId,
        commentId.toString(),
        newLikeStatus
      );
    } else {
      lastLikeStatus = like.myStatus;
      like.update(newLikeStatus);
    }
    comment.updateLike(lastLikeStatus, newLikeStatus);

    await this.commentLikesRepository.save(like);
    await this.commentRepository.save(comment);
    return true;
  }
}

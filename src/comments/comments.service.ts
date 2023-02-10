import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  ICommentLikeModel
} from '../comment-likes/entities/comment.like.entity';
import { CommentLikesRepository } from '../comment-likes/comment.likes.repository';
import { CommentLikesQueryRepository } from '../comment-likes/comment.like.query.repository';
import { DbId, LikeStatus } from '../types/types';
import { InputCreateCommentDto } from './dto/input.create.comment.dto';
import { UserDocument } from '../users/entities/user.entity';
import { CommentsRepository } from './comments.repository';
import { Types } from 'mongoose';
import { PostsRepository } from '../posts/posts.repository';
import { ICommentModel, Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentLikesQueryRepository: CommentLikesQueryRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel,
    @InjectModel(Comment.name) private commentsModel: ICommentModel
  ) {}

  async create(
    createCommentDto: InputCreateCommentDto,
    postId: string,
    user: UserDocument
  ): Promise<DbId> {
    const post = await this.postsRepository.getById(new Types.ObjectId(postId));
    if (!post) throw new NotFoundException();
    const createdComment = this.commentsModel.make(
      createCommentDto.content,
      user?._id.toString(),
      user.login,
      postId
    );
    await this.commentRepository.save(createdComment);
    return createdComment._id;
  }
  async update(
    id: DbId,
    createCommentDto: InputCreateCommentDto,
    user: UserDocument
  ): Promise<boolean> {
    const comment = await this.commentRepository.getById(id);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== user._id.toString())
      throw new ForbiddenException();
    comment.update(createCommentDto.content);
    await this.commentRepository.save(comment);
    return true;
  }
  async delete(id: DbId, user: UserDocument): Promise<boolean> {
    const comment = await this.commentRepository.getById(id);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== user._id.toString())
      throw new ForbiddenException();
    await this.commentRepository.delete(id);
    return true;
  }
  async updateStatusLike(
    user: UserDocument,
    commentId: string,
    newLikeStatus: LikeStatus
  ): Promise<boolean> {
    let lastLikeStatus: LikeStatus = LikeStatus.None;
    const comment = await this.commentRepository.getById(
      new Types.ObjectId(commentId)
    );
    if (!comment) throw new NotFoundException();
    const likeInfo = await this.commentLikesQueryRepository.getLike(
      user._id.toString(),
      commentId
    );
    if (!likeInfo) {
      const newLike = await this.commentLikesModel.make(
        user._id.toString(),
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

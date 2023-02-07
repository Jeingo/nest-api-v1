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
import { DbId, StatusLikeType } from '../types/types';
import { InputCreateCommentDto } from './dto/input.create.comment.dto';
import { UserDocument } from '../users/entities/user.entity';
import { CommentsRepository } from './comments.repository';
import { InputUpdateLikeDto } from './dto/input.update.like.dto';
import { Types } from 'mongoose';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentLikesQueryRepository: CommentLikesQueryRepository,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentRepository: CommentsRepository,
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel
  ) {}
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
    updateLikeDto: InputUpdateLikeDto
  ): Promise<boolean> {
    let lastStatus: StatusLikeType = 'None';
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
        updateLikeDto.likeStatus
      );
      await this.commentLikesRepository.save(newLike);
    } else {
      const commentLike = await this.commentLikesRepository.getById(
        new Types.ObjectId(likeInfo.id)
      );
      commentLike.update(updateLikeDto.likeStatus);
      await this.commentLikesRepository.save(commentLike);
      lastStatus = likeInfo.myStatus;
    }
    return await this.commentRepository.updateLikeInComment(
      comment,
      lastStatus,
      updateLikeDto.likeStatus
    );
  }
}

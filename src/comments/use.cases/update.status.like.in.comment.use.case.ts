import { CommandHandler } from '@nestjs/cqrs';
import { DbId, LikeStatus } from '../../global-types/global.types';
import { CurrentUserType } from '../../auth/types/current.user.type';
import { CommentsRepository } from '../comments.repository';
import { NotFoundException } from '@nestjs/common';
import { CommentLikesRepository } from '../../comment-likes/comment.likes.repository';

export class UpdateLikeStatusInCommentCommand {
  constructor(
    public user: CurrentUserType,
    public commentId: DbId,
    public newLikeStatus: LikeStatus
  ) {}
}

@CommandHandler(UpdateLikeStatusInCommentCommand)
export class UpdateLikeStatusInCommentUseCase {
  constructor(
    private readonly commentRepository: CommentsRepository,
    private readonly commentLikesRepository: CommentLikesRepository
  ) {}

  async execute(command: UpdateLikeStatusInCommentCommand): Promise<boolean> {
    //todo refactoring
    let lastLikeStatus: LikeStatus = LikeStatus.None;

    const comment = await this.commentRepository.getById(command.commentId);
    if (!comment) throw new NotFoundException();
    let like = await this.commentLikesRepository.getByUserIdAndCommentId(
      command.user.userId,
      command.commentId.toString()
    );

    if (!like) {
      like = await this.commentLikesRepository.create(
        command.user.userId,
        command.commentId.toString(),
        command.newLikeStatus
      );
    } else {
      lastLikeStatus = like.myStatus;
      like.update(command.newLikeStatus);
    }
    comment.updateLike(lastLikeStatus, command.newLikeStatus);

    await this.commentLikesRepository.save(like);
    await this.commentRepository.save(comment);
    return true;
  }
}

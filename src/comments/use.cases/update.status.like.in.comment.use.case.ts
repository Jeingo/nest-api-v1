import { CommandHandler } from '@nestjs/cqrs';
import { DbId, LikeStatus } from '../../global-types/global.types';
import { CurrentUserType } from '../../auth/types/current.user.type';
import { CommentsRepository } from '../comments.repository';
import { CommentLikesRepository } from '../../comment-likes/comment.likes.repository';
import { CommentsAndLikesRepository } from '../comments.and.likes.repository';

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
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentsAndLikesRepository: CommentsAndLikesRepository
  ) {}

  async execute(command: UpdateLikeStatusInCommentCommand): Promise<boolean> {
    //todo to ask
    const commentForLikeUpdate = await this.commentsAndLikesRepository.get(
      command.commentId,
      command.user.userId
    );

    commentForLikeUpdate.commentDocument.updateLikeNew(
      command.user,
      command.newLikeStatus,
      commentForLikeUpdate.commentLikeDocument
    );

    await this.commentsAndLikesRepository.save(
      commentForLikeUpdate,
      command.user,
      command.newLikeStatus
    );

    return true;
  }
}

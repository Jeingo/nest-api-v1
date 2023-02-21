import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../global-types/global.types';
import { CurrentUserType } from '../../../auth/api/types/current.user.type';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class RemoveCommentCommand {
  constructor(public id: DbId, public user: CurrentUserType) {}
}

@CommandHandler(RemoveCommentCommand)
export class RemoveCommentUseCase {
  constructor(private readonly commentRepository: CommentsRepository) {}

  async execute(command: RemoveCommentCommand): Promise<boolean> {
    const commentId = command.id;
    const { userId } = command.user;
    const comment = await this.commentRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();
    await this.commentRepository.delete(commentId);
    return true;
  }
}

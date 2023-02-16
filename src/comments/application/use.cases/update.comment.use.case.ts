import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../global-types/global.types';
import { InputCreateCommentDto } from '../../api/dto/input.create.comment.dto';
import { CurrentUserType } from '../../../auth/api/types/current.user.type';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public id: DbId,
    public createCommentDto: InputCreateCommentDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase {
  constructor(private readonly commentRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const comment = await this.commentRepository.getById(command.id);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== command.user.userId)
      throw new ForbiddenException();
    comment.update(command.createCommentDto.content);
    await this.commentRepository.save(comment);
    return true;
  }
}

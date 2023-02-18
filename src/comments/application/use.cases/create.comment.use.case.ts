import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../global-types/global.types';
import { InputCreateCommentDto } from '../../api/dto/input.create.comment.dto';
import { CurrentUserType } from '../../../auth/api/types/current.user.type';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';

export class CreateCommentCommand {
  constructor(
    public createCommentDto: InputCreateCommentDto,
    public postId: DbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase {
  constructor(
    private readonly commentRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  async execute(command: CreateCommentCommand): Promise<DbId> {
    const post = await this.postsRepository.getById(command.postId);
    if (!post) throw new NotFoundException();
    const createdComment = this.commentRepository.create(
      command.createCommentDto.content,
      command.user.userId,
      command.user.login,
      command.postId.toString(),
      post.postOwnerInfo.userId
    );
    await this.commentRepository.save(createdComment);
    return createdComment._id;
  }
}

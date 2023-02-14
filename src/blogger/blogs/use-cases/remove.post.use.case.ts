import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../global-types/global.types';
import { PostsRepository } from '../../../posts/posts.repository';
import { NotFoundException } from '@nestjs/common';

export class RemovePostCommand {
  constructor(public id: DbId) {}
}

@CommandHandler(RemovePostCommand)
export class RemovePostUseCase {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: RemovePostCommand): Promise<boolean> {
    const post = await this.postsRepository.getById(command.id);
    if (!post) throw new NotFoundException();
    await this.postsRepository.delete(command.id);
    return true;
  }
}

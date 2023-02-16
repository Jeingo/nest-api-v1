import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { DbId } from '../../../../global-types/global.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CurrentUserType } from '../../../../auth/api/types/current.user.type';

export class RemoveBlogCommand {
  constructor(public id: DbId, public user: CurrentUserType) {}
}

@CommandHandler(RemoveBlogCommand)
export class RemoveBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: RemoveBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getById(command.id);
    if (!blog) throw new NotFoundException();
    if (blog.blogOwnerInfo.userId !== command.user.userId)
      throw new ForbiddenException();
    await this.blogsRepository.delete(command.id);
    return true;
  }
}

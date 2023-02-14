import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { DbId } from '../../../global-types/global.types';
import { NotFoundException } from '@nestjs/common';

export class RemoveBlogCommand {
  constructor(public id: DbId) {}
}

@CommandHandler(RemoveBlogCommand)
export class RemoveBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: RemoveBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getById(command.id);
    if (!blog) throw new NotFoundException();
    await this.blogsRepository.delete(command.id);
    return true;
  }
}

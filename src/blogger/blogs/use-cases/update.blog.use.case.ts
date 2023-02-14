import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { DbId } from '../../../global-types/global.types';
import { InputUpdateBlogDto } from '../dto/input.update.blog.dto';
import { NotFoundException } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(public id: DbId, public updateBlogDto: InputUpdateBlogDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { name, description, websiteUrl } = command.updateBlogDto;
    const blog = await this.blogsRepository.getById(command.id);
    if (!blog) throw new NotFoundException();
    blog.update(name, description, websiteUrl);
    await this.blogsRepository.save(blog);
    return true;
  }
}

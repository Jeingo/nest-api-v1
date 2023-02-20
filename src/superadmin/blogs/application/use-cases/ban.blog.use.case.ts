import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../../global-types/global.types';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { InputBanBlogDto } from '../../api/dto/input.ban.blog.dto';
import { NotFoundException } from '@nestjs/common';

export class BanBlogCommand {
  constructor(public blogId: DbId, public banBlogDto: InputBanBlogDto) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: BanBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getById(command.blogId);
    if (!blog) throw new NotFoundException();
    blog.banBlog(command.banBlogDto.isBanned);
    await this.blogsRepository.save(blog);
    return true;
  }
}

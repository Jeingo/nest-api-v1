import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../../global-types/global.types';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { InputBanBlogDto } from '../../api/dto/input.ban.blog.dto';
import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';

export class BanBlogCommand {
  constructor(public blogId: DbId, public banBlogDto: InputBanBlogDto) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository
  ) {}

  async execute(command: BanBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getById(command.blogId);
    if (!blog) throw new NotFoundException();

    const posts = await this.postsRepository.getByBlogId(
      command.blogId.toString()
    );

    blog.banBlog(command.banBlogDto.isBanned);
    posts.map((doc) => doc.banFromBlog(command.banBlogDto.isBanned));

    await this.blogsRepository.save(blog);
    posts.map(async (doc) => await this.postsRepository.save(doc));
    return true;
  }
}

import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { DbId } from '../../../global-types/global.types';
import { InputUpdateBlogDto } from '../dto/input.update.blog.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CurrentUserType } from '../../../auth/types/current.user.type';

export class UpdateBlogCommand {
  constructor(
    public id: DbId,
    public updateBlogDto: InputUpdateBlogDto,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { name, description, websiteUrl } = command.updateBlogDto;
    const blog = await this.blogsRepository.getById(command.id);
    if (!blog) throw new NotFoundException();
    if (blog.blogOwnerInfo.userId !== command.user.userId)
      throw new ForbiddenException();
    blog.update(name, description, websiteUrl);
    await this.blogsRepository.save(blog);
    return true;
  }
}

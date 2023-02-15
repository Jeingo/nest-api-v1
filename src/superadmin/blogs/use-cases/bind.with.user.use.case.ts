import { CommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from '../../../users/users.repository';
import { DbId } from '../../../global-types/global.types';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { BadRequestException } from '@nestjs/common';

export class BindWithUserCommand {
  constructor(public blogId: DbId, public userId: DbId) {}
}

@CommandHandler(BindWithUserCommand)
export class BindWithUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: BindWithUserCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getById(command.blogId);
    const user = await this.usersRepository.getById(command.userId);
    if (!blog || !user)
      throw new BadRequestException(['blogId is not correct']);
    if (blog.blogOwnerInfo.userId !== null)
      throw new BadRequestException(['blogId is not correct']);
    blog.blogOwnerInfo.userId = command.userId.toString();
    await this.blogsRepository.save(blog);
    return true;
  }
}

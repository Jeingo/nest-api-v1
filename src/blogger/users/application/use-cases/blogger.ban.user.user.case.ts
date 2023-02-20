import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../../global-types/global.types';
import { InputBloggerUserBanDto } from '../../api/dto/input.blogger.user.ban.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { CurrentUserType } from '../../../../auth/api/types/current.user.type';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { Types } from 'mongoose';

export class BloggerBanUserCommand {
  constructor(
    public bloggerUserBanDto: InputBloggerUserBanDto,
    public userId: DbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(BloggerBanUserCommand)
export class BloggerBanUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: BloggerBanUserCommand): Promise<boolean> {
    const { isBanned, banReason, blogId } = command.bloggerUserBanDto;

    const blog = await this.blogsRepository.getById(new Types.ObjectId(blogId));
    if (blog.blogOwnerInfo.userId !== command.user.userId)
      throw new ForbiddenException();

    const user = await this.usersRepository.getById(command.userId);
    if (!user) throw new NotFoundException();

    user.bloggerBan(isBanned, banReason, blogId);
    await this.usersRepository.save(user);
    return true;
  }
}

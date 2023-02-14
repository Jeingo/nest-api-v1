import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../global-types/global.types';
import { PostsRepository } from '../../../posts/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CurrentUserType } from '../../../auth/types/current.user.type';
import { BlogsRepository } from '../../../blogs/blogs.repository';

export class RemovePostCommand {
  constructor(
    public id: DbId,
    public blogId: DbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(RemovePostCommand)
export class RemovePostUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: RemovePostCommand): Promise<boolean> {
    const blog = await this.blogsRepository.getById(command.blogId);
    const post = await this.postsRepository.getById(command.id);
    if (!post || !blog) throw new NotFoundException();
    if (
      blog.blogOwnerInfo.userId !== command.user.userId ||
      post.postOwnerInfo.userId !== command.user.userId
    )
      throw new ForbiddenException();
    await this.postsRepository.delete(command.id);
    return true;
  }
}

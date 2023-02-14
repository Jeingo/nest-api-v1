import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../global-types/global.types';
import { PostsRepository } from '../../../posts/posts.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CurrentUserType } from '../../../auth/types/current.user.type';
import { InputUpdatePostDto } from '../dto/input.update.post.dto';

export class UpdatePostCommand {
  constructor(
    public id: DbId,
    public updatePostDto: InputUpdatePostDto,
    public blogId: DbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { title, shortDescription, content } = command.updatePostDto;
    const blog = await this.blogsRepository.getById(command.blogId);
    const post = await this.postsRepository.getById(command.id);
    if (!post || !blog) throw new NotFoundException();
    if (
      blog.blogOwnerInfo.userId !== command.user.userId ||
      post.postOwnerInfo.userId !== command.user.userId
    )
      throw new ForbiddenException();
    post.update(
      title,
      shortDescription,
      content,
      command.blogId.toString(),
      blog.name
    );
    await this.postsRepository.save(post);
    return true;
  }
}

import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../../global-types/global.types';
import { PostsRepository } from '../../../posts/posts.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InputCreatePostInBlogsDto } from '../dto/input.create.post.dto';
import { CurrentUserType } from '../../../auth/types/current.user.type';

export class CreatePostInBlogCommand {
  constructor(
    public createPostDto: InputCreatePostInBlogsDto,
    public blogId: DbId,
    public user: CurrentUserType
  ) {}
}

@CommandHandler(CreatePostInBlogCommand)
export class CreatePostInBlogUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: CreatePostInBlogCommand): Promise<DbId> {
    const { title, shortDescription, content } = command.createPostDto;
    const foundBlog = await this.blogsRepository.getById(command.blogId);
    if (!foundBlog) throw new NotFoundException();
    if (foundBlog.blogOwnerInfo.userId !== command.user.userId)
      throw new ForbiddenException();
    const createdPost = this.postsRepository.create(
      title,
      shortDescription,
      content,
      command.blogId.toString(),
      foundBlog.name,
      command.user.userId
    );
    await this.postsRepository.save(createdPost);
    return createdPost._id;
  }
}

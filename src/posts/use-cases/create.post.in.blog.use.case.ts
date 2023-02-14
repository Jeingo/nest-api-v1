import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../global-types/global.types';
import { PostsRepository } from '../posts.repository';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { NotFoundException } from '@nestjs/common';
import { InputCreatePostInBlogsDto } from '../../blogger/blogs/dto/input.create.post.dto';

export class CreatePostInBlogCommand {
  constructor(
    public createPostDto: InputCreatePostInBlogsDto,
    public blogId: DbId
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
    const createdPost = this.postsRepository.create(
      title,
      shortDescription,
      content,
      command.blogId.toString(),
      foundBlog.name
    );
    await this.postsRepository.save(createdPost);
    return createdPost._id;
  }
}

import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../global-types/global.types';
import { InputCreatePostDto } from '../dto/input.create.post.dto';
import { Types } from 'mongoose';
import { PostsRepository } from '../posts.repository';
import { BlogsRepository } from '../../blogs/blogs.repository';

export class CreatePostCommand {
  constructor(public createPostDto: InputCreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: CreatePostCommand): Promise<DbId> {
    const { title, shortDescription, content, blogId } = command.createPostDto;
    const foundBlog = await this.blogsRepository.getById(
      new Types.ObjectId(blogId)
    );
    const createdPost = this.postsRepository.create(
      title,
      shortDescription,
      content,
      blogId,
      foundBlog.name
    );
    await this.postsRepository.save(createdPost);
    return createdPost._id;
  }
}

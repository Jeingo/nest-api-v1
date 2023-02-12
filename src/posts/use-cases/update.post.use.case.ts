import { CommandHandler } from '@nestjs/cqrs';
import { DbId } from '../../global-types/global.types';
import { Types } from 'mongoose';
import { PostsRepository } from '../posts.repository';
import { BlogsRepository } from '../../blogs/blogs.repository';
import { InputUpdatePostDto } from '../dto/input.update.post.dto';
import { NotFoundException } from '@nestjs/common';

export class UpdatePostCommand {
  constructor(public id: DbId, public updatePostDto: InputUpdatePostDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { title, shortDescription, content, blogId } = command.updatePostDto;
    const foundBlog = await this.blogsRepository.getById(
      new Types.ObjectId(blogId)
    );
    const post = await this.postsRepository.getById(command.id);
    if (!post) throw new NotFoundException();
    post.update(title, shortDescription, content, blogId, foundBlog.name);
    await this.postsRepository.save(post);
    return true;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InputCreatePostDto } from './dto/input.create.post.dto';
import { InputUpdatePostDto } from './dto/input.update.post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from './posts.repository';
import { IPostModel, Post } from './entities/post.entity';
import { DbId } from '../types/types';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Types } from 'mongoose';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    @InjectModel(Post.name) private postsModel: IPostModel,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async create(createPostDto: InputCreatePostDto): Promise<DbId> {
    const { title, shortDescription, content, blogId } = createPostDto;
    const foundBlog = await this.blogsRepository.getById(
      new Types.ObjectId(blogId)
    );
    if (!foundBlog) throw new NotFoundException();
    const createdPost = this.postsModel.make(
      title,
      shortDescription,
      content,
      blogId,
      foundBlog.name
    );
    await this.postsRepository.save(createdPost);
    return createdPost._id;
  }

  async update(id: number, updatePostDto: InputUpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(id: number) {
    return `This action removes a #${id} post`;
  }
}

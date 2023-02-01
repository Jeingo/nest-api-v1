import { Injectable, NotFoundException } from '@nestjs/common';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { BlogsRepository } from './blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, IBlogModel } from './entities/blog.entity';
import { DbId } from '../types/types';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private blogsModel: IBlogModel,
  ) {}

  async create(createBlogDto: InputCreateBlogDto): Promise<DbId> {
    const { name, description, websiteUrl } = createBlogDto;
    const createdBlog = this.blogsModel.make(name, description, websiteUrl);
    await this.blogsRepository.save(createdBlog);
    return createdBlog._id;
  }

  async update(id: DbId, updateBlogDto: InputUpdateBlogDto): Promise<boolean> {
    const { name, description, websiteUrl } = updateBlogDto;
    const blog = await this.blogsRepository.getById(id);
    if (!blog) throw new NotFoundException();
    blog.update(name, description, websiteUrl);
    await this.blogsRepository.save(blog);
    return true;
  }

  async remove(id: DbId): Promise<boolean> {
    const blog = await this.blogsRepository.getById(id);
    if (!blog) throw new NotFoundException();
    await this.blogsRepository.delete(id);
    return true;
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { BlogsRepository } from './blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, IBlogModel } from './entities/blog.entity';
import { BlogId } from './types/blogs.type';
import { Types } from 'mongoose';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private blogsModel: IBlogModel,
  ) {}

  async create(createBlogDto: InputCreateBlogDto): Promise<BlogId> {
    const { name, description, websiteUrl } = createBlogDto;
    const createdBlog = this.blogsModel.make(name, description, websiteUrl);
    await this.blogsRepository.save(createdBlog);
    return createdBlog._id;
  }

  async update(
    id: Types.ObjectId,
    updateBlogDto: InputUpdateBlogDto,
  ): Promise<boolean> {
    const { name, description, websiteUrl } = updateBlogDto;
    const blog = await this.blogsRepository.getById(id);
    if (!blog) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    blog.update(name, description, websiteUrl);
    await this.blogsRepository.save(blog);
    return true;
  }

  async remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}

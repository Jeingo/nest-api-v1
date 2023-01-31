import { Injectable } from '@nestjs/common';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { BlogsRepository } from './blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, IBlogModel } from './entities/blog.entity';
import { BlogId } from './types/blogs.type';

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

  async update(id: number, updateBlogDto: InputUpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  async remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}

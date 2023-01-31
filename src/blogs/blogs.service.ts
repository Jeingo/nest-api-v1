import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsRepository } from './blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async create(createBlogDto: CreateBlogDto) {
    return 'This action adds a new blog';
  }

  async findAll() {
    return `This action returns all blogs`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  async remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}

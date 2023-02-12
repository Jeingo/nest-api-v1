import { Injectable, NotFoundException } from '@nestjs/common';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { BlogsRepository } from './blogs.repository';
import { DbId } from '../global-types/global.types';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

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

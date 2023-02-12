import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from './blogs.repository';
import { DbId } from '../global-types/global.types';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async remove(id: DbId): Promise<boolean> {
    const blog = await this.blogsRepository.getById(id);
    if (!blog) throw new NotFoundException();
    await this.blogsRepository.delete(id);
    return true;
  }
}

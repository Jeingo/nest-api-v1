import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, IBlogModel } from './entities/blog.entity';
import { DbId } from '../types/types';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogsModel: IBlogModel) {}

  async getById(id: DbId): Promise<BlogDocument> {
    return this.blogsModel.findById(id);
  }
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }
  async delete(id: DbId): Promise<BlogDocument> {
    return this.blogsModel.findByIdAndDelete(id);
  }
}

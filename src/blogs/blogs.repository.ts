import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, IBlogModel } from './entities/blog.entity';
import { DbId } from '../global-types/global.types';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogsModel: IBlogModel) {}

  create(name: string, description: string, websiteUrl: string): BlogDocument {
    return this.blogsModel.make(name, description, websiteUrl);
  }
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

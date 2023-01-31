import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, IBlogModel } from './entities/blog.entity';
import { Types } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogsModel: IBlogModel) {}

  async getById(id: Types.ObjectId): Promise<BlogDocument> {
    return this.blogsModel.findById(id);
  }
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }
  async delete(id: Types.ObjectId): Promise<BlogDocument> {
    return this.blogsModel.findByIdAndDelete(id);
  }
}

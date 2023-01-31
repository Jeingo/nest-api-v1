import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, IBlogModel } from './entities/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogsModel: IBlogModel) {}
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }
}

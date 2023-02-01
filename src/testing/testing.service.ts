import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, IBlogModel } from '../blogs/entities/blog.entity';

@Injectable()
export class TestingService {
  constructor(@InjectModel(Blog.name) private blogsModel: IBlogModel) {}

  async removeAll() {
    await this.blogsModel.deleteMany({});
  }
}

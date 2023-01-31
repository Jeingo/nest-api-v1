import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, IBlogModel } from './entities/blog.entity';
import { Types } from 'mongoose';
import { OutputBlogDto } from './dto/output.blog.dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogsModel: IBlogModel) {}
  async getById(id: Types.ObjectId): Promise<OutputBlogDto | null> {
    const result = await this.blogsModel.findById(id);
    if (!result) return null;
    return this._getOutputBlogDto(result);
  }
  private _getOutputBlogDto(blog: BlogDocument): OutputBlogDto {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, IBlogModel } from './entities/blog.entity';
import { OutputBlogDto } from './dto/output.blog.dto';
import { QueryBlogs } from './types/blogs.type';
import { PaginatedType } from '../helper/types.query.repository.helper';
import {
  getPaginatedType,
  makeDirectionToNumber,
} from '../helper/query.repository.helper';
import { DbId } from '../types/types';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogsModel: IBlogModel) {}

  async getAll(query: QueryBlogs): Promise<PaginatedType<OutputBlogDto>> {
    const {
      searchNameTerm = null,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10,
    } = query;

    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;
    let filter = {};
    if (searchNameTerm) {
      filter = { name: { $regex: new RegExp(searchNameTerm, 'gi') } };
    }
    const countAllDocuments = await this.blogsModel.countDocuments(filter);
    const result = await this.blogsModel
      .find(filter)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);

    return getPaginatedType(
      result.map(this._getOutputBlogDto),
      +pageSize,
      +pageNumber,
      countAllDocuments,
    );
  }
  async getById(id: DbId): Promise<OutputBlogDto | null> {
    const result = await this.blogsModel.findById(id);
    if (!result) throw new NotFoundException();
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, Post, PostDocument } from './entities/post.entity';
import { DbId } from '../types/types';
import { OutputPostDto } from './dto/output.post.dto';
import { QueryPosts } from './types/posts.type';
import { PaginatedType } from '../helper/types.query.repository.helper';
import {
  getPaginatedType,
  makeDirectionToNumber
} from '../helper/query.repository.helper';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Types } from 'mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postsModel: IPostModel,
    private readonly blogsRepository: BlogsRepository
  ) {}

  async getAll(query: QueryPosts): Promise<PaginatedType<OutputPostDto>> {
    const {
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;
    const countAllDocuments = await this.postsModel.countDocuments({});
    const result = await this.postsModel
      .find({})
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);
    const mappedPost = result.map(this._getOutputPostDto);
    //TODO after like
    return getPaginatedType(
      mappedPost,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getAllByBlogId(
    query: QueryPosts,
    blogId: string
  ): Promise<PaginatedType<OutputPostDto>> {
    const blog = await this.blogsRepository.getById(new Types.ObjectId(blogId));
    if (!blog) throw new NotFoundException();
    const {
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;
    const countAllDocuments = await this.postsModel.countDocuments({});
    const result = await this.postsModel
      .find({ blogId: blogId })
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);
    const mappedPost = result.map(this._getOutputPostDto);
    //TODO after like
    return getPaginatedType(
      mappedPost,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(id: DbId): Promise<OutputPostDto> {
    const result = await this.postsModel.findById(id);
    if (!result) throw new NotFoundException();
    //TODO after like
    return this._getOutputPostDto(result);
  }
  private _getOutputPostDto(post: PostDocument): OutputPostDto {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: 'None',
        newestLikes: []
      }
    };
  }
}

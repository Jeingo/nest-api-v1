import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, Post, PostDocument } from './entities/post.entity';
import { DbId, Direction, LikeStatus } from '../global-types/global.types';
import { OutputPostDto } from './dto/output.post.dto';
import { QueryPosts } from './types/posts.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import {
  getPaginatedType,
  makeDirectionToNumber
} from '../helper/query/query.repository.helper';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Types } from 'mongoose';
import { UserDocument } from '../users/entities/user.entity';
import { PostLikesQueryRepository } from '../post-likes/post.likes.query.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postsModel: IPostModel,
    private readonly blogsRepository: BlogsRepository,
    private readonly postLikesQueryRepository: PostLikesQueryRepository
  ) {}

  async getAll(
    query: QueryPosts,
    user?: UserDocument
  ): Promise<PaginatedType<OutputPostDto>> {
    const {
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
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
    const mappedPostWithStatusLike = await this._setStatusLike(
      mappedPost,
      user?._id.toString()
    );
    const mappedFinishPost = await this._setThreeLastUser(
      mappedPostWithStatusLike
    );
    return getPaginatedType(
      mappedFinishPost,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getAllByBlogId(
    query: QueryPosts,
    blogId: string,
    user?: UserDocument
  ): Promise<PaginatedType<OutputPostDto>> {
    const blog = await this.blogsRepository.getById(new Types.ObjectId(blogId));
    if (!blog) throw new NotFoundException();
    const {
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;
    const countAllDocuments = await this.postsModel.countDocuments({
      blogId: blogId
    });
    const result = await this.postsModel
      .find({ blogId: blogId })
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);
    const mappedPost = result.map(this._getOutputPostDto);
    const mappedPostWithStatusLike = await this._setStatusLike(
      mappedPost,
      user?._id.toString()
    );
    const mappedFinishPost = await this._setThreeLastUser(
      mappedPostWithStatusLike
    );
    return getPaginatedType(
      mappedFinishPost,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(id: DbId, user?: UserDocument): Promise<OutputPostDto> {
    const result = await this.postsModel.findById(id);
    if (!result) throw new NotFoundException();
    const mappedResult = this._getOutputPostDto(result);
    if (user && mappedResult) {
      const like = await this.postLikesQueryRepository.getLike(
        user?._id.toString(),
        mappedResult.id
      );
      if (like) {
        mappedResult.extendedLikesInfo.myStatus = like.myStatus;
      }
    }
    if (mappedResult) {
      const lastThreeLikes =
        await this.postLikesQueryRepository.getLastThreeLikes(mappedResult.id);
      if (lastThreeLikes) {
        mappedResult.extendedLikesInfo.newestLikes = lastThreeLikes;
      }
    }
    return mappedResult;
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
        myStatus: LikeStatus.None,
        newestLikes: []
      }
    };
  }
  private async _setStatusLike(posts: Array<OutputPostDto>, userId: string) {
    if (!userId) return posts;
    for (let i = 0; i < posts.length; i++) {
      const like = await this.postLikesQueryRepository.getLike(
        userId,
        posts[i].id
      );
      if (like) {
        posts[i].extendedLikesInfo.myStatus = like.myStatus;
      }
    }
    return posts;
  }
  private async _setThreeLastUser(posts: Array<OutputPostDto>) {
    for (let i = 0; i < posts.length; i++) {
      const lastThreeLikes =
        await this.postLikesQueryRepository.getLastThreeLikes(posts[i].id);
      if (lastThreeLikes) {
        posts[i].extendedLikesInfo.newestLikes = lastThreeLikes;
      }
    }
    return posts;
  }
}

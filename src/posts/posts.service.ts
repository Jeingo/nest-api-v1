import { Injectable, NotFoundException } from '@nestjs/common';
import { InputUpdatePostDto } from './dto/input.update.post.dto';
import { PostsRepository } from './posts.repository';
import { DbId, LikeStatus } from '../global-types/global.types';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Types } from 'mongoose';
import { InputCreatePostInBlogsDto } from '../blogs/dto/input.create.post.dto';
import { PostLikesRepository } from '../post-likes/post.likes.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postLikesRepository: PostLikesRepository
  ) {}

  async createInBlogs(
    createPostDto: InputCreatePostInBlogsDto,
    blogId: DbId
  ): Promise<DbId> {
    const { title, shortDescription, content } = createPostDto;
    const foundBlog = await this.blogsRepository.getById(blogId);
    if (!foundBlog) throw new NotFoundException();
    const createdPost = this.postsRepository.create(
      title,
      shortDescription,
      content,
      blogId.toString(),
      foundBlog.name
    );
    await this.postsRepository.save(createdPost);
    return createdPost._id;
  }

  async update(id: DbId, updatePostDto: InputUpdatePostDto): Promise<boolean> {
    const { title, shortDescription, content, blogId } = updatePostDto;
    const foundBlog = await this.blogsRepository.getById(
      new Types.ObjectId(blogId)
    );
    const post = await this.postsRepository.getById(id);
    if (!post) throw new NotFoundException();
    post.update(title, shortDescription, content, blogId, foundBlog.name);
    await this.postsRepository.save(post);
    return true;
  }

  async remove(id: DbId): Promise<boolean> {
    const post = await this.postsRepository.getById(id);
    if (!post) throw new NotFoundException();
    await this.postsRepository.delete(id);
    return true;
  }
  async updateStatusLike(
    userId: string,
    postId: DbId,
    login: string,
    newLikeStatus: LikeStatus
  ): Promise<boolean> {
    let lastLikeStatus: LikeStatus = LikeStatus.None;

    const post = await this.postsRepository.getById(new Types.ObjectId(postId));
    if (!post) throw new NotFoundException();
    let like = await this.postLikesRepository.getByUserIdAndPostId(
      userId,
      postId.toString()
    );
    if (!like) {
      like = this.postLikesRepository.create(
        userId,
        postId.toString(),
        newLikeStatus,
        login
      );
    } else {
      lastLikeStatus = like.myStatus;
      like.update(newLikeStatus);
    }
    post.updateLike(lastLikeStatus, newLikeStatus);

    await this.postLikesRepository.save(like);
    await this.postsRepository.save(post);
    return true;
  }
}

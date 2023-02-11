import { Injectable, NotFoundException } from '@nestjs/common';
import { InputCreatePostDto } from './dto/input.create.post.dto';
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

  async create(createPostDto: InputCreatePostDto): Promise<DbId> {
    const { title, shortDescription, content, blogId } = createPostDto;
    const foundBlog = await this.blogsRepository.getById(
      new Types.ObjectId(blogId)
    );
    const createdPost = this.postsRepository.create(
      title,
      shortDescription,
      content,
      blogId,
      foundBlog.name
    );
    await this.postsRepository.save(createdPost);
    return createdPost._id;
  }

  async createInBlogs(
    createPostDto: InputCreatePostInBlogsDto,
    blogId: string
  ): Promise<DbId> {
    const { title, shortDescription, content } = createPostDto;
    const foundBlog = await this.blogsRepository.getById(
      new Types.ObjectId(blogId)
    );
    if (!foundBlog) throw new NotFoundException();
    const createdPost = this.postsRepository.create(
      title,
      shortDescription,
      content,
      blogId,
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
    postId: string,
    login: string,
    newLikeStatus: LikeStatus
  ): Promise<boolean> {
    let lastStatus: LikeStatus = LikeStatus.None;
    const post = await this.postsRepository.getById(new Types.ObjectId(postId));
    if (!post) throw new NotFoundException();
    const like = await this.postLikesRepository.getByUserIdAndPostId(
      userId,
      postId
    );
    if (!like) {
      const newLike = this.postLikesRepository.create(
        userId,
        postId,
        newLikeStatus,
        login
      );
      await this.postLikesRepository.save(newLike);
    } else {
      const postLike = await this.postLikesRepository.getById(like._id);
      postLike.update(newLikeStatus);
      await this.postLikesRepository.save(postLike);
      lastStatus = like.myStatus;
    }
    //todo refactoring
    //post.addLike(like)
    //add like -> like.update(postId, status)
    //like update -> this.postId = postId...
    //virtual like
    //repo.addLikeToPost(post, like)
    //post.save()
    //post.virtualLike.save()
    return await this.postsRepository.updateLikeInPost(
      post,
      lastStatus,
      newLikeStatus
    );
  }
}

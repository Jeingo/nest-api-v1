import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InputCreatePostDto } from './dto/input.create.post.dto';
import { InputUpdatePostDto } from './dto/input.update.post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from './posts.repository';
import { IPostModel, Post } from './entities/post.entity';
import { DbId, LikeStatus } from '../global-types/global.types';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Types } from 'mongoose';
import { InputCreatePostInBlogsDto } from '../blogs/dto/input.create.post.dto';
import { PostLikesQueryRepository } from '../post-likes/post.likes.query.repository';
import {
  IPostLikeModel,
  PostLike
} from '../post-likes/entities/post.like.entity';
import { PostLikesRepository } from '../post-likes/post.likes.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    @InjectModel(Post.name) private postsModel: IPostModel,
    private readonly blogsRepository: BlogsRepository,
    private readonly postLikesQueryRepository: PostLikesQueryRepository,
    private readonly postLikesRepository: PostLikesRepository,
    @InjectModel(PostLike.name) private postLikesModel: IPostLikeModel
  ) {}

  async create(createPostDto: InputCreatePostDto): Promise<DbId> {
    const { title, shortDescription, content, blogId } = createPostDto;
    if (!Types.ObjectId.isValid(blogId))
      throw new BadRequestException(['blogId ID is bad']);
    const foundBlog = await this.blogsRepository.getById(
      new Types.ObjectId(blogId)
    );
    if (!foundBlog) throw new BadRequestException(['blogId ID not found']);
    const createdPost = this.postsModel.make(
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
    const createdPost = this.postsModel.make(
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
    if (!Types.ObjectId.isValid(blogId))
      throw new BadRequestException(['blogId ID is bad']);
    const foundBlog = await this.blogsRepository.getById(
      new Types.ObjectId(blogId)
    );
    if (!foundBlog) throw new BadRequestException(['blogId ID not found']);
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
    const likeInfo = await this.postLikesQueryRepository.getLike(
      userId,
      postId
    );
    if (!likeInfo) {
      const newLike = this.postLikesModel.make(
        userId,
        postId,
        newLikeStatus,
        login
      );
      await this.postLikesRepository.save(newLike);
    } else {
      const postLike = await this.postLikesRepository.getById(
        new Types.ObjectId(likeInfo.id)
      );
      postLike.update(newLikeStatus);
      await this.postLikesRepository.save(postLike);
      lastStatus = likeInfo.myStatus;
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

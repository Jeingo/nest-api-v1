import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { DbId, LikeStatus } from '../global-types/global.types';
import { BlogsRepository } from '../blogs/blogs.repository';
import { Types } from 'mongoose';
import { PostLikesRepository } from '../post-likes/post.likes.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postLikesRepository: PostLikesRepository
  ) {}

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

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostLikesRepository } from './post.likes.repository';
import { IPostLikeModel, PostLike } from './entities/post.like.entity';
import { InputCreatePostLikeDto } from './dto/input.create.post.like.dto';
import { DbId } from '../types/types';
import { InputUpdatePostLikeDto } from './dto/input.update.post.like.dto';

@Injectable()
export class PostLikesService {
  constructor(
    private readonly postLikesRepository: PostLikesRepository,
    @InjectModel(PostLike.name) private postLikesModel: IPostLikeModel
  ) {}
  async create(createPostLikeDto: InputCreatePostLikeDto): Promise<DbId> {
    const { userId, postId, myStatus, login } = createPostLikeDto;
    const createdPostLike = this.postLikesModel.make(
      userId,
      postId,
      myStatus,
      login
    );
    await this.postLikesRepository.save(createdPostLike);
    return createdPostLike._id;
  }
  async update(
    id: DbId,
    updatePostLikeDto: InputUpdatePostLikeDto
  ): Promise<boolean> {
    const likePost = await this.postLikesRepository.getById(id);
    likePost.update(updatePostLikeDto.myStatus);
    await this.postLikesRepository.save(likePost);
    return true;
  }
}

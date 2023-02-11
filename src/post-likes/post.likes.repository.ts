import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  IPostLikeModel,
  PostLike,
  PostLikeDocument
} from './entities/post.like.entity';
import { DbId, LikeStatus } from '../global-types/global.types';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectModel(PostLike.name) private postLikesModel: IPostLikeModel
  ) {}

  create(
    userId: string,
    postId: string,
    myStatus: LikeStatus,
    login: string
  ): PostLikeDocument {
    return this.postLikesModel.make(userId, postId, myStatus, login);
  }
  async getById(id: DbId): Promise<PostLikeDocument> {
    return this.postLikesModel.findById(id);
  }
  async save(postLike: PostLikeDocument): Promise<PostLikeDocument> {
    return await postLike.save();
  }
}

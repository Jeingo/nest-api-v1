import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  IPostLikeModel,
  PostLike,
  PostLikeDocument
} from './entities/post.like.entity';
import { DbId, LikeStatus } from '../global-types/global.types';
import { NewestLikesType } from '../posts/types/posts.type';

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
  async getByUserIdAndPostId(
    userId: string,
    postId: string
  ): Promise<PostLikeDocument> {
    return this.postLikesModel.findOne({
      userId: userId,
      postId: postId
    });
  }
  async save(postLike: PostLikeDocument): Promise<PostLikeDocument> {
    return await postLike.save();
  }
  async getLastThreeLikes(postId: string): Promise<NewestLikesType[] | null> {
    const desc = -1;
    const threeLastUser = 3;
    const likeStatus = LikeStatus.Like;
    const result = await this.postLikesModel
      .find({
        postId: postId,
        myStatus: likeStatus
      })
      .sort({ addedAt: desc })
      .limit(threeLastUser);

    if (!result) return null;
    return result.map(this._getOutputExtendedLike);
  }
  private _getOutputExtendedLike(like: PostLikeDocument): NewestLikesType {
    return {
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.login
    };
  }
}

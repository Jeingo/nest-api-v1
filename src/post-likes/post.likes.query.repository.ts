import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  IPostLikeModel,
  PostLike,
  PostLikeDocument
} from './entities/post.like.entity';
import { OutputPostLikeDto } from './dto/output.post.like.dto';
import { OutputExtendedPostLikeDto } from './dto/output.extended.post.like.dto';

@Injectable()
export class PostLikesQueryRepository {
  constructor(
    @InjectModel(PostLike.name) private postLikesModel: IPostLikeModel
  ) {}
  async getLastThreeLikes(
    postId: string
  ): Promise<OutputExtendedPostLikeDto[] | null> {
    const desc = -1;
    const threeLastUser = 3;
    const like = 'Like';
    const result = await this.postLikesModel
      .find({
        postId: postId,
        myStatus: like
      })
      .sort({ addedAt: desc })
      .limit(threeLastUser);

    if (!result) return null;
    return result.map(this._getOutputExtendedLike);
  }

  async getLike(
    userId: string,
    postId: string
  ): Promise<OutputPostLikeDto | null> {
    const result = await this.postLikesModel.findOne({
      userId: userId,
      postId: postId
    });
    if (!result) return null;
    return this._getOutputLike(result);
  }
  private _getOutputLike(like: PostLikeDocument): OutputPostLikeDto {
    return {
      id: like._id.toString(),
      userId: like.userId,
      postId: like.postId,
      myStatus: like.myStatus,
      login: like.login,
      addedAt: like.addedAt
    };
  }
  private _getOutputExtendedLike(
    like: PostLikeDocument
  ): OutputExtendedPostLikeDto {
    return {
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.login
    };
  }
}

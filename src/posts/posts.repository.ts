import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, Post, PostDocument } from './entities/post.entity';
import { DbId, StatusLikeType } from '../types/types';
import { getUpdatedLike } from '../helper/query/post.like.repository.helper';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postsModel: IPostModel) {}

  async getById(id: DbId): Promise<PostDocument> {
    return this.postsModel.findById(id);
  }
  async save(post: PostDocument): Promise<PostDocument> {
    return await post.save();
  }
  async delete(id: DbId): Promise<PostDocument> {
    return this.postsModel.findByIdAndDelete(id);
  }
  async updateLikeInPost(
    post: PostDocument,
    lastStatus: StatusLikeType,
    newStatus: StatusLikeType
  ): Promise<boolean> {
    const newLikesInfo = getUpdatedLike(
      {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount
      },
      lastStatus,
      newStatus
    );
    const result = await this.postsModel.findByIdAndUpdate(post._id, {
      extendedLikesInfo: newLikesInfo
    });
    return !!result;
  }
}

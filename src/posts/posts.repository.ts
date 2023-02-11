import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, Post, PostDocument } from './entities/post.entity';
import { DbId, LikeStatus } from '../global-types/global.types';
import { getUpdatedLike } from '../helper/query/post.like.repository.helper';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postsModel: IPostModel) {}

  create(
    title: string,
    description: string,
    content: string,
    blogId: string,
    blogName: string
  ): PostDocument {
    return this.postsModel.make(title, description, content, blogId, blogName);
  }
  async getById(id: DbId): Promise<PostDocument> {
    return this.postsModel.findById(id);
  }
  async save(post: PostDocument): Promise<PostDocument> {
    return await post.save();
  }
  async delete(id: DbId): Promise<PostDocument> {
    return this.postsModel.findByIdAndDelete(id);
  }
  //todo move to entity
  async updateLikeInPost(
    post: PostDocument,
    lastStatus: LikeStatus,
    newStatus: LikeStatus
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

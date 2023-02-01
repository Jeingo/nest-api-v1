import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPostModel, Post, PostDocument } from './entities/post.entity';
import { DbId } from '../types/types';

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
}

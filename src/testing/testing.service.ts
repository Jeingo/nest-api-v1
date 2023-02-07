import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, IBlogModel } from '../blogs/entities/blog.entity';
import { IUserModel, User } from '../users/entities/user.entity';
import { IPostModel, Post } from '../posts/entities/post.entity';
import { Comment, ICommentModel } from '../comments/entities/comment.entity';
import { ISessionModel, Session } from '../sessions/entities/session.entity';
import {
  IPostLikeModel,
  PostLike
} from '../post-likes/entities/post.like.entity';

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: IBlogModel,
    @InjectModel(User.name) private usersModel: IUserModel,
    @InjectModel(Post.name) private postsModel: IPostModel,
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    @InjectModel(Session.name) private sessionsModel: ISessionModel,
    @InjectModel(PostLike.name) private postLikesModel: IPostLikeModel
  ) {}

  async removeAll() {
    await this.blogsModel.deleteMany({});
    await this.usersModel.deleteMany({});
    await this.postsModel.deleteMany({});
    await this.commentsModel.deleteMany({});
    await this.sessionsModel.deleteMany({});
    await this.postLikesModel.deleteMany({});
  }
}

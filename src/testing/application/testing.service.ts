import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, IBlogModel } from '../../blogs/application/entities/blog.entity';
import { IUserModel, User } from '../../users/application/entities/user.entity';
import { IPostModel, Post } from '../../posts/application/entities/post.entity';
import {
  Comment,
  ICommentModel
} from '../../comments/application/entities/comment.entity';
import {
  ISessionModel,
  Session
} from '../../sessions/application/entities/session.entity';
import {
  IPostLikeModel,
  PostLike
} from '../../post-likes/application/entities/post.like.entity';
import {
  CommentLike,
  ICommentLikeModel
} from '../../comment-likes/application/entities/comment.like.entity';

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: IBlogModel,
    @InjectModel(User.name) private usersModel: IUserModel,
    @InjectModel(Post.name) private postsModel: IPostModel,
    @InjectModel(Comment.name) private commentsModel: ICommentModel,
    @InjectModel(Session.name) private sessionsModel: ISessionModel,
    @InjectModel(PostLike.name) private postLikesModel: IPostLikeModel,
    @InjectModel(CommentLike.name) private commentLikesModel: ICommentLikeModel
  ) {}

  async removeAll() {
    await this.blogsModel.deleteMany({});
    await this.usersModel.deleteMany({});
    await this.postsModel.deleteMany({});
    await this.commentsModel.deleteMany({});
    await this.sessionsModel.deleteMany({});
    await this.postLikesModel.deleteMany({});
    await this.commentLikesModel.deleteMany({});
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, IBlogModel } from '../blogs/entities/blog.entity';
import { IUserModel, User } from '../users/entities/user.entity';
import { IPostModel, Post } from '../posts/entities/post.entity';
import { Comment, ICommentModel } from '../comments/entities/comment.entity';

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: IBlogModel,
    @InjectModel(User.name) private usersModel: IUserModel,
    @InjectModel(Post.name) private postsModel: IPostModel,
    @InjectModel(Comment.name) private commentsModel: ICommentModel
  ) {}

  async removeAll() {
    await this.blogsModel.deleteMany({});
    await this.usersModel.deleteMany({});
    await this.postsModel.deleteMany({});
    await this.commentsModel.deleteMany({});
  }
}

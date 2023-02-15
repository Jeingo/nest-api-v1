import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../global-types/global.types';
import { getUpdatedLike } from '../../helper/query/post.like.repository.helper';

export type CommentDocument = HydratedDocument<Comment>;

type StaticCommentMethods = {
  make: (
    this: ICommentModel,
    content: string,
    userId: string,
    userLogin: string,
    postId: string
  ) => CommentDocument;
};

export type ICommentModel = Model<CommentDocument> & StaticCommentMethods;

@Schema({ _id: false })
class CommentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true })
  isBaned: boolean;
}

@Schema({ _id: false })
class LikesInfo {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;
}

@Schema()
export class Comment {
  @Prop({ required: true, maxlength: 300, minlength: 20 })
  content: string;

  @Prop({ required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  likesInfo: LikesInfo;

  update: (content: string) => boolean;
  updateLike: (lastStatus: LikeStatus, newStatus: LikeStatus) => boolean;
  ban: (isBanned: boolean) => boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.statics.make = function (
  this: ICommentModel,
  content: string,
  userId: string,
  userLogin: string,
  postId: string
): CommentDocument {
  return new this({
    content: content,
    createdAt: new Date().toISOString(),
    postId: postId,
    commentatorInfo: {
      userId: userId,
      userLogin: userLogin,
      isBaned: false
    },
    likesInfo: {
      likesCount: 0,
      dislikesCount: 0
    }
  });
};

CommentSchema.methods.update = function (content: string): boolean {
  this.content = content;
  return true;
};

CommentSchema.methods.updateLike = function (
  lastStatus: LikeStatus,
  newStatus: LikeStatus
): boolean {
  const newLikesInfo = getUpdatedLike(
    {
      likesCount: this.likesInfo.likesCount,
      dislikesCount: this.likesInfo.dislikesCount
    },
    lastStatus,
    newStatus
  );
  this.likesInfo.likesCount = newLikesInfo.likesCount;
  this.likesInfo.dislikesCount = newLikesInfo.dislikesCount;
  return true;
};

CommentSchema.methods.ban = function (isBanned: boolean): boolean {
  this.commentatorInfo.isBaned = isBanned;
  return true;
};

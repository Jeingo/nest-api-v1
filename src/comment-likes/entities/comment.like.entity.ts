import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../global-types/global.types';

export type CommentLikeDocument = HydratedDocument<CommentLike>;

type StaticCommentLikeMethods = {
  make: (
    this: ICommentLikeModel,
    userId: string,
    commentId: string,
    myStatus: LikeStatus
  ) => CommentLikeDocument;
};

export type ICommentLikeModel = Model<CommentLikeDocument> &
  StaticCommentLikeMethods;

@Schema()
export class CommentLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  isBaned: boolean;

  @Prop({ required: true })
  commentId: string;

  @Prop({ required: true })
  myStatus: LikeStatus;

  update: (myStatus: LikeStatus) => boolean;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

CommentLikeSchema.statics.make = function (
  this: ICommentLikeModel,
  userId: string,
  commentId: string,
  myStatus: LikeStatus
): CommentLikeDocument {
  return new this({
    userId: userId,
    isBaned: false,
    commentId: commentId,
    myStatus: myStatus
  });
};

CommentLikeSchema.methods.update = function (myStatus: LikeStatus): boolean {
  this.myStatus = myStatus;
  return true;
};

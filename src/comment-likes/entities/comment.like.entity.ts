import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { StatusLikeType } from '../../types/types';

export type CommentLikeDocument = HydratedDocument<CommentLike>;

type StaticCommentLikeMethods = {
  make: (
    this: ICommentLikeModel,
    userId: string,
    commentId: string,
    myStatus: StatusLikeType
  ) => CommentLikeDocument;
};

export type ICommentLikeModel = Model<CommentLikeDocument> &
  StaticCommentLikeMethods;

@Schema()
export class CommentLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  commentId: string;

  @Prop({ required: true })
  myStatus: StatusLikeType;

  update: (myStatus: StatusLikeType) => CommentLikeDocument;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

CommentLikeSchema.statics.make = function (
  this: ICommentLikeModel,
  userId: string,
  commentId: string,
  myStatus: StatusLikeType
) {
  return new this({
    userId: userId,
    commentId: commentId,
    myStatus: myStatus
  });
};

CommentLikeSchema.methods.update = function (myStatus: StatusLikeType) {
  this.myStatus = myStatus;
};

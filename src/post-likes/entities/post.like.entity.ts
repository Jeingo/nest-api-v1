import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { StatusLikeType } from '../../types/types';

export type PostLikeDocument = HydratedDocument<PostLike>;

type StaticPostLikeMethods = {
  make: (
    this: IPostLikeModel,
    userId: string,
    postId: string,
    myStatus: StatusLikeType,
    login: string
  ) => PostLikeDocument;
};

export type IPostLikeModel = Model<PostLikeDocument> & StaticPostLikeMethods;

@Schema()
export class PostLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  myStatus: StatusLikeType;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  addedAt: string;

  update: (myStatus: StatusLikeType) => PostLikeDocument;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

PostLikeSchema.statics.make = function (
  this: IPostLikeModel,
  userId: string,
  postId: string,
  myStatus: StatusLikeType,
  login: string
) {
  return new this({
    userId: userId,
    postId: postId,
    myStatus: myStatus,
    login: login,
    addedAt: new Date().toISOString()
  });
};

PostLikeSchema.methods.update = function (myStatus: StatusLikeType) {
  this.myStatus = myStatus;
};

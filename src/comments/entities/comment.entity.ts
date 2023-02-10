import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

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

  update: (content: string) => CommentDocument;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.statics.make = function (
  this: ICommentModel,
  content: string,
  userId: string,
  userLogin: string,
  postId: string
) {
  return new this({
    content: content,
    createdAt: new Date().toISOString(),
    postId: postId,
    commentatorInfo: {
      userId: userId,
      userLogin: userLogin
    },
    likesInfo: {
      likesCount: 0,
      dislikesCount: 0
    }
  });
};

CommentSchema.methods.update = function (content: string) {
  this.content = content;
};

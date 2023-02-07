import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

type StaticPostMethods = {
  make: (
    this: IPostModel,
    title: string,
    description: string,
    content: string,
    blogId: string,
    blogName: string
  ) => PostDocument;
};

export type IPostModel = Model<PostDocument> & StaticPostMethods;

@Schema()
class ExtendedLikesInfo {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;
}

@Schema()
export class Post {
  @Prop({ required: true, maxlength: 30 })
  title: string;

  @Prop({ required: true, maxlength: 100 })
  shortDescription: string;

  @Prop({ required: true, maxlength: 1000 })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  extendedLikesInfo: ExtendedLikesInfo;

  update: (
    title: string,
    description: string,
    content: string,
    blogId: string,
    blogName: string
  ) => PostDocument;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.statics.make = function (
  this: IPostModel,
  title: string,
  description: string,
  content: string,
  blogId: string,
  blogName: string
) {
  return new this({
    title: title,
    shortDescription: description,
    content: content,
    blogId: blogId,
    blogName: blogName,
    createdAt: new Date().toISOString(),
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0
    }
  });
};

PostSchema.methods.update = function (
  title: string,
  description: string,
  content: string,
  blogId: string,
  blogName: string
) {
  this.title = title;
  this.shortDescription = description;
  this.content = content;
  this.blogId = blogId;
  this.blogName = blogName;
};

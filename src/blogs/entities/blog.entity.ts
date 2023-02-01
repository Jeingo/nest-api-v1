import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

type StaticBlogMethods = {
  make: (
    this: IBlogModel,
    name: string,
    description: string,
    websiteUrl: string
  ) => BlogDocument;
};

export type IBlogModel = Model<BlogDocument> & StaticBlogMethods;

@Schema()
export class Blog {
  @Prop({ required: true, maxlength: 15 })
  name: string;

  @Prop({ required: true, maxlength: 500 })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true, maxlength: 100 })
  createdAt: string;

  update: (
    name: string,
    description: string,
    websiteUrl: string
  ) => BlogDocument;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.statics.make = function (
  this: IBlogModel,
  name: string,
  description: string,
  websiteUrl: string
) {
  return new this({
    name: name,
    description: description,
    websiteUrl: websiteUrl,
    createdAt: new Date().toISOString()
  });
};

BlogSchema.methods.update = function (
  name: string,
  description: string,
  websiteUrl: string
) {
  this.name = name;
  this.description = description;
  this.websiteUrl = websiteUrl;
};

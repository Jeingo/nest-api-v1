import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

type StaticMethods = {
  make: (
    this: IBlogModel,
    name: string,
    description: string,
    websiteUrl: string,
  ) => BlogDocument;
};

export type IBlogModel = Model<BlogDocument> & StaticMethods;

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

  // myUpdate: () => void;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

// BlogSchema.methods.myUpdate = function () {
//   console.log('myUpdate');
// };

BlogSchema.statics.make = function (
  this: IBlogModel,
  name: string,
  description: string,
  websiteUrl: string,
) {
  return new this({
    name: name,
    description: description,
    websiteUrl: websiteUrl,
    createdAt: new Date().toISOString(),
  });
};

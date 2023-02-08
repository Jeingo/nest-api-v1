// import {
//   ValidationArguments,
//   ValidatorConstraint,
//   ValidatorConstraintInterface
// } from 'class-validator';
// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Blog, IBlogModel } from '../blogs/entities/blog.entity';
// import { Types } from 'mongoose';
// import { BlogsRepository } from '../blogs/blogs.repository';
//
// @ValidatorConstraint({ async: true })
// @Injectable()
// export class IsBlogIdConstraint implements ValidatorConstraintInterface {
//   constructor(
//     @InjectModel(Blog.name) private blogsModel: IBlogModel,
//     private readonly blogsRepository: BlogsRepository
//   ) {}
//
//   async validate(blogId: string, args: ValidationArguments) {
//     const blog = await this.blogsRepository.getById(new Types.ObjectId(blogId));
//     return !!blog;
//   }
//   defaultMessage(args: ValidationArguments) {
//     return `blogId it isn't correct`;
//   }
// }

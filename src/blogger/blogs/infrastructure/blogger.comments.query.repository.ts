// import { Injectable } from '@nestjs/common';
// import { CurrentUserType } from '../../../auth/api/types/current.user.type';
// import { Direction, PaginatedType } from '../../../global-types/global.types';
// import { OutputBlogDto } from '../../../blogs/api/dto/output.blog.dto';
// import {
//   getPaginatedType,
//   makeDirectionToNumber
// } from '../../../helper/query/query.repository.helper';
// import { QueryComments } from '../../../comments/api/types/query.comments.type';
// import { OutputBloggerCommentsDto } from '../api/dto/output.blogger.comments.dto';
// import { InjectModel } from '@nestjs/mongoose';
// import {
//   Blog,
//   IBlogModel
// } from '../../../blogs/application/entities/blog.entity';
// import {
//   IPostModel,
//   Post
// } from '../../../posts/application/entities/post.entity';
// import { ICommentModel } from '../../../comments/application/entities/comment.entity';
//
// @Injectable()
// export class BloggerCommentsQueryRepository {
//   constructor(
//     @InjectModel(Post.name) protected postsModel: IPostModel,
//     @InjectModel(Comment.name) protected commentsModel: ICommentModel
//   ) {}
//
//   async getAllForBlogger(
//     query: QueryComments,
//     user: CurrentUserType
//   ): Promise<PaginatedType<OutputBloggerCommentsDto>> {
//     //todo refactoring
//     const {
//       sortBy = 'createdAt',
//       sortDirection = Direction.DESC,
//       pageNumber = 1,
//       pageSize = 10
//     } = query;
//
//     const allPosts = await this.postsModel.find({
//       'postOwnerInfo.userId': user.userId
//     });
//
//     const sortDirectionNumber = makeDirectionToNumber(sortDirection);
//     const skipNumber = (+pageNumber - 1) * +pageSize;
//
//     // const countAllDocuments = await this.blogsModel.countDocuments({
//     //   'blogOwnerInfo.userId': user.userId
//     // });
//     // const result = await this.blogsModel
//     //   .find({ 'blogOwnerInfo.userId': user.userId })
//     //   .sort({ [sortBy]: sortDirectionNumber })
//     //   .skip(skipNumber)
//     //   .limit(+pageSize);
//     //
//     // return getPaginatedType(
//     //   result.map(this._getOutputBlogDto),
//     //   +pageSize,
//     //   +pageNumber,
//     //   countAllDocuments
//     // );
//   }
// }

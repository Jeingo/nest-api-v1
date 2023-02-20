import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DbId,
  Direction,
  PaginatedType
} from '../../../global-types/global.types';
import { OutputBloggerUserDto } from '../api/dto/output.blogger.user.dto';
import { QueryBannedUsers } from '../api/types/query.banned.users.type';
import {
  bannedFilter,
  getPaginatedType,
  makeDirectionToNumber
} from '../../../helper/query/query.repository.helper';
import { InjectModel } from '@nestjs/mongoose';
import {
  IUserModel,
  User,
  UserDocument
} from '../../../users/application/entities/user.entity';

@Injectable()
export class BloggerUsersQueryRepository {
  constructor(@InjectModel(User.name) protected usersModel: IUserModel) {}

  async getBannedUserByBlogId(
    blogId: DbId,
    query: QueryBannedUsers
  ): Promise<PaginatedType<OutputBloggerUserDto>> {
    const {
      searchLoginTerm = null,
      sortBy = 'createdAt',
      sortDirection = Direction.DESC,
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;
    let filter = {};
    if (searchLoginTerm) {
      filter = { login: { $regex: new RegExp(searchLoginTerm, 'gi') } };
    }
    const finalFilter = {
      ...filter,
      ...bannedFilter('banInfo.isBanned'),
      'bloggerBanInfo.blogId': blogId.toString()
    };
    const countAllDocuments = await this.usersModel.countDocuments(finalFilter);
    const result = await this.usersModel
      .find(finalFilter)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);

    if (result.length === 0) throw new NotFoundException();

    const mappedResult = this._getOutputBannedUserDto(
      result,
      blogId.toString()
    );

    return getPaginatedType(
      mappedResult,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }

  protected _getOutputBannedUserDto(
    users: UserDocument[],
    blogId: string
  ): OutputBloggerUserDto[] {
    return users.map((user) => {
      const bloggerBanInfo = user.bloggerBanInfo.filter(
        (info) => info.blogId === blogId
      );
      return {
        id: user._id.toString(),
        login: user.login,
        banInfo: {
          isBanned: true,
          banDate: bloggerBanInfo[0].banDate,
          banReason: bloggerBanInfo[0].banReason
        }
      };
    });
  }
}

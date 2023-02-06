import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUserModel, User, UserDocument } from './entities/user.entity';
import { DbId } from '../types/types';
import { OutputUserDto } from './dto/output.user.dto';
import { QueryUsers } from './types/users.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import {
  getPaginatedType,
  makeDirectionToNumber
} from '../helper/query/query.repository.helper';
import { OutputUserMeDto } from '../auth/dto/output.user.me.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private usersModel: IUserModel) {}

  async getAll(query: QueryUsers): Promise<PaginatedType<OutputUserDto>> {
    const {
      searchLoginTerm = null,
      searchEmailTerm = null,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10
    } = query;
    const sortDirectionNumber = makeDirectionToNumber(sortDirection);
    const skipNumber = (+pageNumber - 1) * +pageSize;

    const filter = (a: any, b: any) => ({ $or: [a, b] });
    const loginFilter = searchLoginTerm
      ? { login: { $regex: new RegExp(searchLoginTerm, 'gi') } }
      : {};
    const emailFilter = searchEmailTerm
      ? { email: { $regex: new RegExp(searchEmailTerm, 'gi') } }
      : {};
    const filterMain = filter(loginFilter, emailFilter);
    const countAllDocuments = await this.usersModel.countDocuments(filterMain);
    const result = await this.usersModel
      .find(filterMain)
      .sort({ [sortBy]: sortDirectionNumber })
      .skip(skipNumber)
      .limit(+pageSize);
    const mappedUser = result.map(this._getOutputUser);
    return getPaginatedType(
      mappedUser,
      +pageSize,
      +pageNumber,
      countAllDocuments
    );
  }
  async getById(id: DbId): Promise<OutputUserDto> {
    const result = await this.usersModel.findById(id);
    if (!result) throw new NotFoundException();
    return this._getOutputUser(result);
  }
  async getMeById(id: DbId): Promise<OutputUserMeDto> {
    const result = await this.usersModel.findById(id);
    if (!result) throw new NotFoundException();
    return this._getOutputMeUser(result);
  }
  private _getOutputUser(user: UserDocument): OutputUserDto {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt
    };
  }
  private _getOutputMeUser(user: UserDocument): OutputUserMeDto {
    return {
      email: user.email,
      login: user.login,
      userId: user._id.toString()
    };
  }
}

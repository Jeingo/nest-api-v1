import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt.auth.guard';
import { CheckIdAndParseToDBId } from '../../../helper/pipes/check.id.validator.pipe';
import { DbId, PaginatedType } from '../../../global-types/global.types';
import { OutputBloggerUserDto } from './dto/output.blogger.user.dto';
import { BloggerUsersQueryRepository } from '../infrastructure/blogger.users.query.repository';
import { QueryBannedUsers } from './types/query.banned.users.type';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private readonly bloggerUsersQueryRepository: BloggerUsersQueryRepository
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('blog/:blogId')
  async findBannedUsers(
    @Param('blogId', new CheckIdAndParseToDBId()) blogId: DbId,
    @Query() query: QueryBannedUsers
  ): Promise<PaginatedType<OutputBloggerUserDto>> {
    return await this.bloggerUsersQueryRepository.getBannedUserByBlogId(
      blogId,
      query
    );
  }
}

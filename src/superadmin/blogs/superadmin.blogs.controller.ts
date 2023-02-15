import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SuperAdminBlogsQueryRepository } from './superadmin.blogs.query.repository';
import { QueryBlogs } from '../../blogs/types/query.blogs.type';
import { PaginatedType } from '../../helper/query/types.query.repository.helper';
import { OutputSuperAdminBlogDto } from './dto/output.superadmin.blog.dto';
import { BasicAuthGuard } from '../../auth/guards/basic.auth.guard';
import { BindWithUserCommand } from './use-cases/bind.with.user.use.case';
import { Types } from 'mongoose';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly superAdminBlogsQueryRepository: SuperAdminBlogsQueryRepository
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryBlogs
  ): Promise<PaginatedType<OutputSuperAdminBlogDto>> {
    return await this.superAdminBlogsQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/bind-with-user/:userId')
  async bindWithUser(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string
  ) {
    await this.commandBus.execute(
      new BindWithUserCommand(
        new Types.ObjectId(blogId),
        new Types.ObjectId(userId)
      )
    );
    return;
  }
}

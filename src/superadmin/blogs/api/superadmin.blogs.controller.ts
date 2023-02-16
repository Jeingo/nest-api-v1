import {
  BadRequestException,
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
import { SuperAdminBlogsQueryRepository } from '../infrastructure/superadmin.blogs.query.repository';
import { QueryBlogs } from '../../../blogs/api/types/query.blogs.type';
import { OutputSuperAdminBlogDto } from './dto/output.superadmin.blog.dto';
import { BasicAuthGuard } from '../../../auth/infrastructure/guards/basic.auth.guard';
import { BindWithUserCommand } from '../application/use-cases/bind.with.user.use.case';
import { Types } from 'mongoose';
import { PaginatedType } from '../../../global-types/global.types';

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
    if (!Types.ObjectId.isValid(blogId) || !Types.ObjectId.isValid(blogId))
      throw new BadRequestException(['blogId is not correct']);
    await this.commandBus.execute(
      new BindWithUserCommand(
        new Types.ObjectId(blogId),
        new Types.ObjectId(userId)
      )
    );
    return;
  }
}

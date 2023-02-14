import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { OutputBlogDto } from '../../blogs/dto/output.blog.dto';
import { CreateBlogCommand } from './use-cases/create.blog.use.case';
import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';
import { CurrentUser } from '../../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from '../../auth/types/current.user.type';
import { QueryBlogs } from '../../blogs/types/query.blogs.type';
import { PaginatedType } from '../../helper/query/types.query.repository.helper';
import { BloggerBlogsQueryRepository } from './blogger.blogs.query.repository';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private readonly bloggerBlogsQueryRepository: BloggerBlogsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createBlogDto: InputCreateBlogDto,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputBlogDto> {
    const createdBlogId = await this.commandBus.execute(
      new CreateBlogCommand(createBlogDto, user)
    );
    return await this.bloggerBlogsQueryRepository.getById(createdBlogId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryBlogs,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputBlogDto>> {
    return await this.bloggerBlogsQueryRepository.getAllForBlogger(query, user);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  Query,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { BlogsQueryRepository } from './blogs.query.repository';
import { OutputBlogDto } from './dto/output.blog.dto';
import { QueryBlogs } from './types/query.blogs.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import { InputCreatePostInBlogsDto } from './dto/input.create.post.dto';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { QueryPosts } from '../posts/types/query.posts.type';
import { OutputPostDto } from '../posts/dto/output.post.dto';
import { GetUserGuard } from '../auth/guards/get.user.guard';
import { CheckIdAndParseToDBId } from '../helper/pipes/check.id.validator.pipe';
import { CurrentUser } from '../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from '../auth/types/current.user.type';
import { DbId } from '../global-types/global.types';
import { BasicAuthGuard } from '../auth/guards/basic.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './use-cases/create.blog.use.case';
import { UpdateBlogCommand } from './use-cases/update.blog.use.case';
import { RemoveBlogCommand } from './use-cases/remove.blog.use.case';
import { CreatePostInBlogCommand } from '../posts/use-cases/create.post.in.blog.use.case';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createBlogDto: InputCreateBlogDto
  ): Promise<OutputBlogDto> {
    const createdBlogId = await this.commandBus.execute(
      new CreateBlogCommand(createBlogDto)
    );
    return await this.blogsQueryRepository.getById(createdBlogId);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryBlogs
  ): Promise<PaginatedType<OutputBlogDto>> {
    return await this.blogsQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId
  ): Promise<OutputBlogDto> {
    return await this.blogsQueryRepository.getById(id);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @Body() updateBlogDto: InputUpdateBlogDto
  ) {
    await this.commandBus.execute(new UpdateBlogCommand(id, updateBlogDto));
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', new CheckIdAndParseToDBId()) id: DbId) {
    await this.commandBus.execute(new RemoveBlogCommand(id));
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPost(
    @Param('blogId', new CheckIdAndParseToDBId()) blogId: DbId,
    @Body() createPostDto: InputCreatePostInBlogsDto
  ): Promise<OutputPostDto> {
    const createdPostId = await this.commandBus.execute(
      new CreatePostInBlogCommand(createPostDto, blogId)
    );
    return await this.postsQueryRepository.getById(createdPostId);
  }

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':blogId/posts')
  async findAllPostsByBlogId(
    @Query() query: QueryPosts,
    @Param('blogId', new CheckIdAndParseToDBId()) blogId: DbId,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputPostDto>> {
    return await this.postsQueryRepository.getAllByBlogId(query, blogId, user);
  }
}

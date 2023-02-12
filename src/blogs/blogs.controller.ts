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
import { BlogsService } from './blogs.service';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { BlogsQueryRepository } from './blogs.query.repository';
import { OutputBlogDto } from './dto/output.blog.dto';
import { QueryBlogs } from './types/blogs.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import { InputCreatePostInBlogsDto } from './dto/input.create.post.dto';
import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { QueryPosts } from '../posts/types/posts.type';
import { OutputPostDto } from '../posts/dto/output.post.dto';
import { BasicGuard } from '../auth/guards/basic.guard';
import { GetUserGuard } from '../auth/guards/get.user.guard';
import { CheckIdAndParseToDBId } from '../helper/pipes/check.id.validator.pipe';
import { CurrentUser } from '../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from '../auth/types/current.user.type';
import { DbId } from '../global-types/global.types';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createBlogDto: InputCreateBlogDto
  ): Promise<OutputBlogDto> {
    const createdBlogId = await this.blogsService.create(createBlogDto);
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

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @Body() updateBlogDto: InputUpdateBlogDto
  ) {
    await this.blogsService.update(id, updateBlogDto);
    return;
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', new CheckIdAndParseToDBId()) id: DbId) {
    return this.blogsService.remove(id);
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPost(
    @Param('blogId', new CheckIdAndParseToDBId()) blogId: DbId,
    @Body() createPostDto: InputCreatePostInBlogsDto
  ): Promise<OutputPostDto> {
    const createdPostId = await this.postsService.createInBlogs(
      createPostDto,
      blogId
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

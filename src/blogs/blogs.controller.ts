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
  NotFoundException,
  UseGuards,
  Req
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { BlogsQueryRepository } from './blogs.query.repository';
import { OutputBlogDto } from './dto/output.blog.dto';
import { QueryBlogs } from './types/blogs.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import { Types } from 'mongoose';
import { InputCreatePostInBlogsDto } from './dto/input.create.post.dto';
import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { QueryPosts } from '../posts/types/posts.type';
import { OutputPostDto } from '../posts/dto/output.post.dto';
import { BasicGuard } from '../helper/guards/basic.guard';
import { GetUserGuard } from '../helper/guards/get.user.guard';

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
  async findOne(@Param('id') id: string): Promise<OutputBlogDto> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    return await this.blogsQueryRepository.getById(new Types.ObjectId(id));
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: InputUpdateBlogDto
  ) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    await this.blogsService.update(new Types.ObjectId(id), updateBlogDto);
    return;
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    return this.blogsService.remove(new Types.ObjectId(id));
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPost(
    @Param('blogId') blogId: string,
    @Body() createPostDto: InputCreatePostInBlogsDto
  ): Promise<OutputPostDto> {
    if (!Types.ObjectId.isValid(blogId)) throw new NotFoundException();
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
    @Param('blogId') blogId: string,
    @Req() req
  ): Promise<PaginatedType<OutputPostDto>> {
    return await this.postsQueryRepository.getAllByBlogId(query, blogId);
  }
}

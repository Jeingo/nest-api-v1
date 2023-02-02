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
  HttpStatus
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { BlogsQueryRepository } from './blogs.query.repository';
import { OutputBlogDto } from './dto/output.blog.dto';
import { QueryBlogs } from './types/blogs.type';
import { PaginatedType } from '../helper/types.query.repository.helper';
import { Types } from 'mongoose';
import { InputCreatePostInBlogsDto } from './dto/input.create.post.dto';
import { PostsService } from '../posts/posts.service';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { OutputPostInBlogsDto } from './dto/output.post.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}

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
    return await this.blogsQueryRepository.getById(new Types.ObjectId(id));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: InputUpdateBlogDto
  ) {
    return this.blogsService.update(new Types.ObjectId(id), updateBlogDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogsService.remove(new Types.ObjectId(id));
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPost(
    @Param('blogId') blogId: string,
    @Body() createPostDto: InputCreatePostInBlogsDto
  ): Promise<OutputPostInBlogsDto> {
    const createdPostId = await this.postsService.createInBlogs(
      createPostDto,
      blogId
    );
    return await this.postsQueryRepository.getById(createdPostId);
  }
}

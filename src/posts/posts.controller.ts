import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Put
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { InputCreatePostDto } from './dto/input.create.post.dto';
import { InputUpdatePostDto } from './dto/input.update.post.dto';
import { PostsQueryRepository } from './posts.query.repository';
import { OutputPostDto } from './dto/output.post.dto';
import { QueryPosts } from './types/posts.type';
import { PaginatedType } from '../helper/types.query.repository.helper';
import { Types } from 'mongoose';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createPostDto: InputCreatePostDto
  ): Promise<OutputPostDto> {
    const createdPostId = await this.postsService.create(createPostDto);
    return await this.postsQueryRepository.getById(createdPostId);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryPosts
  ): Promise<PaginatedType<OutputPostDto>> {
    return await this.postsQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postsQueryRepository.getById(new Types.ObjectId(id));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: InputUpdatePostDto
  ) {
    return this.postsService.update(new Types.ObjectId(id), updatePostDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.postsService.remove(new Types.ObjectId(id));
  }
}

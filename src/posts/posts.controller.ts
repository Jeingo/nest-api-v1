import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { InputCreatePostDto } from './dto/input.create.post.dto';
import { InputUpdatePostDto } from './dto/input.update.post.dto';
import { PostsQueryRepository } from './posts.query.repository';
import { OutputPostDto } from './dto/output.post.dto';
import { QueryPosts } from './types/posts.type';
import { PaginatedType } from '../helper/types.query.repository.helper';

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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    //
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: InputUpdatePostDto
  ) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}

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
  Put,
  UseGuards,
  Req,
  NotFoundException
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { InputCreatePostDto } from './dto/input.create.post.dto';
import { InputUpdatePostDto } from './dto/input.update.post.dto';
import { PostsQueryRepository } from './posts.query.repository';
import { OutputPostDto } from './dto/output.post.dto';
import { QueryPosts } from './types/posts.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import { Types } from 'mongoose';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { QueryComments } from '../comments/types/comments.type';
import { OutputCommentDto } from '../comments/dto/output.comment.dto';
import { GetUserGuard } from '../helper/guards/get.user.guard';
import { BasicGuard } from '../helper/guards/basic.guard';
import { BearerGuard } from '../helper/guards/bearer.guard';
import { InputCreateCommentDto } from '../comments/dto/input.create.comment.dto';
import { CommentsService } from '../comments/comments.service';
import { InputUpdatePostLikeDto } from '../post-likes/dto/input.update.post.like.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsService: CommentsService
  ) {}

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createPostDto: InputCreatePostDto
  ): Promise<OutputPostDto> {
    const createdPostId = await this.postsService.create(createPostDto);
    return await this.postsQueryRepository.getById(createdPostId);
  }

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryPosts,
    @Req() req
  ): Promise<PaginatedType<OutputPostDto>> {
    return await this.postsQueryRepository.getAll(query, req.user);
  }

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req): Promise<OutputPostDto> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    return await this.postsQueryRepository.getById(
      new Types.ObjectId(id),
      req.user
    );
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: InputUpdatePostDto
  ) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    await this.postsService.update(new Types.ObjectId(id), updatePostDto);
    return;
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    await this.postsService.remove(new Types.ObjectId(id));
    return;
  }

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':postId/comments')
  async findAllCommentsByPostId(
    @Query() query: QueryComments,
    @Param('postId') postId: string,
    @Req() req
  ): Promise<PaginatedType<OutputCommentDto>> {
    if (!Types.ObjectId.isValid(postId)) throw new NotFoundException();
    return await this.commentsQueryRepository.getAllByPostId(
      query,
      postId,
      req.user
    );
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comments')
  async createCommentByPostId(
    @Param('postId') postId: string,
    @Body() createCommentDto: InputCreateCommentDto,
    @Req() req
  ): Promise<OutputCommentDto> {
    if (!Types.ObjectId.isValid(postId)) throw new NotFoundException();
    const createdCommentId = await this.commentsService.create(
      createCommentDto,
      postId,
      req.user
    );
    return await this.commentsQueryRepository.getById(createdCommentId);
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':postId/like-status')
  async updateStatusLike(
    @Param('postId') postId: string,
    @Body() updatePostLikeDto: InputUpdatePostLikeDto,
    @Req() req
  ) {
    if (!Types.ObjectId.isValid(postId)) throw new NotFoundException();
    const likeDto = {
      userId: req.user._id.toString(),
      postId: postId,
      myStatus: updatePostLikeDto.likeStatus,
      login: req.user.login
    };
    await this.postsService.updateStatusLike(likeDto);
    return;
  }
}

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
import { GetUserGuard } from '../auth/guards/get.user.guard';
import { BasicGuard } from '../auth/guards/basic.guard';
import { BearerGuard } from '../auth/guards/bearer.guard';
import { InputCreateCommentDto } from '../comments/dto/input.create.comment.dto';
import { CommentsService } from '../comments/comments.service';
import { InputUpdatePostLikeDto } from './dto/input.update.post.like.dto';
import { CheckIdAndParseToDBId } from '../helper/pipes/check.id.validator.pipe';
import { CurrentUser } from '../helper/decorators/current.user.decorator';
import { CurrentUserType } from '../auth/types/current.user.type';
import { DbId } from '../global-types/global.types';

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
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputPostDto>> {
    return await this.postsQueryRepository.getAll(query, user);
  }

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputPostDto> {
    return await this.postsQueryRepository.getById(id, user);
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @Body() updatePostDto: InputUpdatePostDto
  ) {
    await this.postsService.update(id, updatePostDto);
    return;
  }

  @UseGuards(BasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', new CheckIdAndParseToDBId()) id: DbId) {
    await this.postsService.remove(id);
    return;
  }

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':postId/comments')
  async findAllCommentsByPostId(
    @Query() query: QueryComments,
    @Param('postId') postId: string,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputCommentDto>> {
    if (!Types.ObjectId.isValid(postId)) throw new NotFoundException();
    return await this.commentsQueryRepository.getAllByPostId(
      query,
      postId,
      user
    );
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comments')
  async createCommentByPostId(
    @Param('postId', new CheckIdAndParseToDBId()) postId: DbId,
    @Body() createCommentDto: InputCreateCommentDto,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputCommentDto> {
    const createdCommentId = await this.commentsService.create(
      createCommentDto,
      postId,
      user
    );
    return await this.commentsQueryRepository.getById(createdCommentId);
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':postId/like-status')
  async updateStatusLike(
    @Param('postId', new CheckIdAndParseToDBId()) postId: DbId,
    @Body() updatePostLikeDto: InputUpdatePostLikeDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.postsService.updateStatusLike(
      user.userId,
      postId,
      user.login,
      updatePostLikeDto.likeStatus
    );
    return;
  }
}

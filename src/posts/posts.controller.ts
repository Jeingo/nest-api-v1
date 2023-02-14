import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Put,
  UseGuards
} from '@nestjs/common';
import { PostsQueryRepository } from './posts.query.repository';
import { OutputPostDto } from './dto/output.post.dto';
import { QueryPosts } from './types/query.posts.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { QueryComments } from '../comments/types/query.comments.type';
import { OutputCommentDto } from '../comments/dto/output.comment.dto';
import { GetUserGuard } from '../auth/guards/get.user.guard';
import { InputCreateCommentDto } from '../comments/dto/input.create.comment.dto';
import { InputUpdatePostLikeDto } from './dto/input.update.post.like.dto';
import { CheckIdAndParseToDBId } from '../helper/pipes/check.id.validator.pipe';
import { CurrentUser } from '../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from '../auth/types/current.user.type';
import { DbId } from '../global-types/global.types';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../comments/use.cases/create.comment.use.case';
import { UpdateStatusLikeInPostCommand } from './use-cases/update.status.like.in.post.use.case';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

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

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':postId/comments')
  async findAllCommentsByPostId(
    @Query() query: QueryComments,
    @Param('postId', new CheckIdAndParseToDBId()) postId: DbId,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputCommentDto>> {
    return await this.commentsQueryRepository.getAllByPostId(
      query,
      postId,
      user
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comments')
  async createCommentByPostId(
    @Param('postId', new CheckIdAndParseToDBId()) postId: DbId,
    @Body() createCommentDto: InputCreateCommentDto,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputCommentDto> {
    const createdCommentId = await this.commandBus.execute(
      new CreateCommentCommand(createCommentDto, postId, user)
    );
    return await this.commentsQueryRepository.getById(createdCommentId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':postId/like-status')
  async updateStatusLike(
    @Param('postId', new CheckIdAndParseToDBId()) postId: DbId,
    @Body() updatePostLikeDto: InputUpdatePostLikeDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(
      new UpdateStatusLikeInPostCommand(
        user.userId,
        postId,
        user.login,
        updatePostLikeDto.likeStatus
      )
    );
    return;
  }
}

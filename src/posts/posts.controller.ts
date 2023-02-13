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
  UseGuards
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { InputCreatePostDto } from './dto/input.create.post.dto';
import { InputUpdatePostDto } from './dto/input.update.post.dto';
import { PostsQueryRepository } from './posts.query.repository';
import { OutputPostDto } from './dto/output.post.dto';
import { QueryPosts } from './types/posts.type';
import { PaginatedType } from '../helper/query/types.query.repository.helper';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { QueryComments } from '../comments/types/comments.type';
import { OutputCommentDto } from '../comments/dto/output.comment.dto';
import { GetUserGuard } from '../auth/guards/get.user.guard';
import { InputCreateCommentDto } from '../comments/dto/input.create.comment.dto';
import { InputUpdatePostLikeDto } from './dto/input.update.post.like.dto';
import { CheckIdAndParseToDBId } from '../helper/pipes/check.id.validator.pipe';
import { CurrentUser } from '../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from '../auth/types/current.user.type';
import { DbId } from '../global-types/global.types';
import { BasicAuthGuard } from '../auth/guards/basic.auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../comments/use.cases/create.comment.use.case';
import { CreatePostCommand } from './use-cases/create.post.use.case';
import { UpdatePostCommand } from './use-cases/update.post.use.case';
import { RemovePostCommand } from './use-cases/remove.post.use.case';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createPostDto: InputCreatePostDto
  ): Promise<OutputPostDto> {
    const createdPostId = await this.commandBus.execute(
      new CreatePostCommand(createPostDto)
    );
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

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @Body() updatePostDto: InputUpdatePostDto
  ) {
    await this.commandBus.execute(new UpdatePostCommand(id, updatePostDto));
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', new CheckIdAndParseToDBId()) id: DbId) {
    await this.commandBus.execute(new RemovePostCommand(id));
    return;
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
    await this.postsService.updateStatusLike(
      user.userId,
      postId,
      user.login,
      updatePostLikeDto.likeStatus
    );
    return;
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { OutputBlogDto } from '../../blogs/dto/output.blog.dto';
import { CreateBlogCommand } from './use-cases/create.blog.use.case';
import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';
import { CurrentUser } from '../../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from '../../auth/types/current.user.type';
import { QueryBlogs } from '../../blogs/types/query.blogs.type';
import { PaginatedType } from '../../helper/query/types.query.repository.helper';
import { BloggerBlogsQueryRepository } from './blogger.blogs.query.repository';
import { CheckIdAndParseToDBId } from '../../helper/pipes/check.id.validator.pipe';
import { DbId } from '../../global-types/global.types';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { UpdateBlogCommand } from './use-cases/update.blog.use.case';
import { RemoveBlogCommand } from './use-cases/remove.blog.use.case';
import { InputCreatePostInBlogsDto } from './dto/input.create.post.dto';
import { OutputPostDto } from '../../posts/dto/output.post.dto';
import { CreatePostInBlogCommand } from './use-cases/create.post.in.blog.use.case';
import { PostsQueryRepository } from '../../posts/posts.query.repository';
import { UpdatePostCommand } from './use-cases/update.post.use.case';
import { InputUpdatePostDto } from './dto/input.update.post.dto';
import { RemovePostCommand } from './use-cases/remove.post.use.case';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private readonly bloggerBlogsQueryRepository: BloggerBlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createBlogDto: InputCreateBlogDto,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputBlogDto> {
    const createdBlogId = await this.commandBus.execute(
      new CreateBlogCommand(createBlogDto, user)
    );
    return await this.bloggerBlogsQueryRepository.getById(createdBlogId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() query: QueryBlogs,
    @CurrentUser() user: CurrentUserType
  ): Promise<PaginatedType<OutputBlogDto>> {
    return await this.bloggerBlogsQueryRepository.getAllForBlogger(query, user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @Body() updateBlogDto: InputUpdateBlogDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(
      new UpdateBlogCommand(id, updateBlogDto, user)
    );
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(new RemoveBlogCommand(id, user));
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':blogId/posts')
  async createPost(
    @Param('blogId', new CheckIdAndParseToDBId()) blogId: DbId,
    @Body() createPostDto: InputCreatePostInBlogsDto,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputPostDto> {
    const createdPostId = await this.commandBus.execute(
      new CreatePostInBlogCommand(createPostDto, blogId, user)
    );
    return await this.postsQueryRepository.getById(createdPostId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/posts/:id')
  async updatePost(
    @Param('blogId', new CheckIdAndParseToDBId()) blogId: DbId,
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @Body() updatePostDto: InputUpdatePostDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(
      new UpdatePostCommand(id, updatePostDto, blogId, user)
    );
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':blogId/posts/:id')
  async removePost(
    @Param('blogId', new CheckIdAndParseToDBId()) blogId: DbId,
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commandBus.execute(new RemovePostCommand(id, blogId, user));
    return;
  }
}

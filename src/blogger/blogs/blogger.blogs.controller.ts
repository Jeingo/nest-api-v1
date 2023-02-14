import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { OutputBlogDto } from '../../blogs/dto/output.blog.dto';
import { CreateBlogCommand } from './use-cases/create.blog.use.case';
import { BlogsQueryRepository } from '../../blogs/blogs.query.repository';
import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard';
import { CurrentUser } from '../../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from '../../auth/types/current.user.type';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
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
    return await this.blogsQueryRepository.getById(createdBlogId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { InputCreateBlogDto } from './dto/input.create.blog.dto';
import { InputUpdateBlogDto } from './dto/input.update.blog.dto';
import { BlogsQueryRepository } from './blogs.query.repository';
import { OutputBlogDto } from './dto/output.blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @HttpCode(201)
  @Post()
  async create(
    @Body() createBlogDto: InputCreateBlogDto,
  ): Promise<OutputBlogDto> {
    const createdBlogId = await this.blogsService.create(createBlogDto);
    return await this.blogsQueryRepository.getById(createdBlogId);
  }

  @Get()
  async findAll() {
    return this.blogsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.blogsService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: InputUpdateBlogDto,
  ) {
    return this.blogsService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogsService.remove(+id);
  }
}

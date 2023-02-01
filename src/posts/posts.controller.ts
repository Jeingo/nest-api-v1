import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { InputCreatePostDto } from './dto/input.create.post.dto';
import { InputUpdatePostDto } from './dto/input.update.post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: InputCreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll() {
    //
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    //
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: InputUpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}

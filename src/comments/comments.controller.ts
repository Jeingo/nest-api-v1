import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }
}

import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repository';
import { Types } from 'mongoose';
import { OutputCommentDto } from './dto/output.comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OutputCommentDto> {
    return this.commentsQueryRepository.getById(new Types.ObjectId(id));
  }
}

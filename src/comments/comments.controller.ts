import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards
} from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repository';
import { Types } from 'mongoose';
import { OutputCommentDto } from './dto/output.comment.dto';
import { GetUserGuard } from '../helper/guards/get.user.guard';
import { BearerGuard } from '../helper/guards/bearer.guard';
import { InputCreateCommentDto } from './dto/input.create.comment.dto';
import { CommentsService } from './comments.service';
import { InputUpdateLikeDto } from './dto/input.update.like.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentService: CommentsService
  ) {}

  @UseGuards(GetUserGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req
  ): Promise<OutputCommentDto> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    return this.commentsQueryRepository.getById(
      new Types.ObjectId(id),
      req.user
    );
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() createCommentDto: InputCreateCommentDto,
    @Req() req
  ) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    await this.commentService.update(
      new Types.ObjectId(id),
      createCommentDto,
      req.user
    );
    return;
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId/like-status')
  async updateStatusLike(
    @Param('commentId') commentId: string,
    @Body() updateLikeDto: InputUpdateLikeDto,
    @Req() req
  ) {
    if (!Types.ObjectId.isValid(commentId)) throw new NotFoundException();
    await this.commentService.updateStatusLike(
      req.user,
      commentId,
      updateLikeDto
    );
    return;
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    await this.commentService.delete(new Types.ObjectId(id), req.user);
    return;
  }
}

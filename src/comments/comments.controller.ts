import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards
} from '@nestjs/common';
import { CommentsQueryRepository } from './comments.query.repository';
import { Types } from 'mongoose';
import { OutputCommentDto } from './dto/output.comment.dto';
import { GetUserGuard } from '../auth/guards/get.user.guard';
import { BearerGuard } from '../auth/guards/bearer.guard';
import { InputCreateCommentDto } from './dto/input.create.comment.dto';
import { CommentsService } from './comments.service';
import { InputUpdateLikeDto } from './dto/input.update.like.dto';
import { CheckIdValidationPipe } from '../helper/pipes/check.id.validator.pipe';

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
    @Param('id', new CheckIdValidationPipe()) id: string,
    @Req() req
  ): Promise<OutputCommentDto> {
    return this.commentsQueryRepository.getById(
      new Types.ObjectId(id),
      req.user
    );
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckIdValidationPipe()) id: string,
    @Body() createCommentDto: InputCreateCommentDto,
    @Req() req
  ) {
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
    @Param('commentId', new CheckIdValidationPipe()) commentId: string,
    @Body() updateLikeDto: InputUpdateLikeDto,
    @Req() req
  ) {
    await this.commentService.updateStatusLike(
      req.user,
      commentId,
      updateLikeDto.likeStatus
    );
    return;
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('id', new CheckIdValidationPipe()) id: string,
    @Req() req
  ) {
    await this.commentService.delete(new Types.ObjectId(id), req.user);
    return;
  }
}

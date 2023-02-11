import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
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
import { CurrentUser } from '../helper/decorators/current.user.decorator';
import { UserDocument } from '../users/entities/user.entity';

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
    @CurrentUser() user: UserDocument
  ): Promise<OutputCommentDto> {
    return this.commentsQueryRepository.getById(new Types.ObjectId(id), user);
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckIdValidationPipe()) id: string,
    @Body() createCommentDto: InputCreateCommentDto,
    @CurrentUser() user: UserDocument
  ) {
    await this.commentService.update(
      new Types.ObjectId(id),
      createCommentDto,
      user
    );
    return;
  }

  @UseGuards(BearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId/like-status')
  async updateStatusLike(
    @Param('commentId', new CheckIdValidationPipe()) commentId: string,
    @Body() updateLikeDto: InputUpdateLikeDto,
    @CurrentUser() user: UserDocument
  ) {
    await this.commentService.updateStatusLike(
      user,
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
    @CurrentUser() user: UserDocument
  ) {
    await this.commentService.delete(new Types.ObjectId(id), user);
    return;
  }
}

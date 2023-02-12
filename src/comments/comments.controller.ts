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
import { OutputCommentDto } from './dto/output.comment.dto';
import { GetUserGuard } from '../auth/guards/get.user.guard';
import { InputCreateCommentDto } from './dto/input.create.comment.dto';
import { CommentsService } from './comments.service';
import { InputUpdateLikeDto } from './dto/input.update.like.dto';
import { CheckIdAndParseToDBId } from '../helper/pipes/check.id.validator.pipe';
import { CurrentUser } from '../helper/get-decorators/current.user.decorator';
import { CurrentUserType } from '../auth/types/current.user.type';
import { DbId } from '../global-types/global.types';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

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
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @CurrentUser() user: CurrentUserType
  ): Promise<OutputCommentDto> {
    return this.commentsQueryRepository.getById(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id', new CheckIdAndParseToDBId()) id: DbId,
    @Body() createCommentDto: InputCreateCommentDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commentService.update(id, createCommentDto, user);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId/like-status')
  async updateStatusLike(
    @Param('commentId', new CheckIdAndParseToDBId()) commentId: DbId,
    @Body() updateLikeDto: InputUpdateLikeDto,
    @CurrentUser() user: CurrentUserType
  ) {
    await this.commentService.updateStatusLike(
      user,
      commentId,
      updateLikeDto.likeStatus
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
    await this.commentService.delete(id, user);
    return;
  }
}

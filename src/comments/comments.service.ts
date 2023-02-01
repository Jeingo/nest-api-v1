import { Injectable } from '@nestjs/common';
import { InputCreateCommentDto } from './dto/input.create.comment.dto';

@Injectable()
export class CommentsService {
  create(createCommentDto: InputCreateCommentDto) {
    return 'This action adds a new comment';
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}

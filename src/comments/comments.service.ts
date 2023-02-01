import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }
}

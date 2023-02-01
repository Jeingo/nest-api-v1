import { Injectable } from '@nestjs/common';
import { InputCreatePostDto } from './dto/input.create.post.dto';
import { InputUpdatePostDto } from './dto/input.update.post.dto';

@Injectable()
export class PostsService {
  create(createPostDto: InputCreatePostDto) {
    return 'This action adds a new post';
  }

  update(id: number, updatePostDto: InputUpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}

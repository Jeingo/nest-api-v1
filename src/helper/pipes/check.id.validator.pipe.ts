import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class CheckIdValidationPipe implements PipeTransform {
  transform(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    return id;
  }
}

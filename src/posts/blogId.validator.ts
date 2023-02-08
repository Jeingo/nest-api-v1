import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogsRepository } from '../blogs/blogs.repository';

@ValidatorConstraint({ name: 'blogId', async: true })
@Injectable()
export class IsBlogIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(blogId: string, args: ValidationArguments) {
    const blog = await this.blogsRepository.getById(new Types.ObjectId(blogId));
    return !!blog;
  }
  defaultMessage(args: ValidationArguments) {
    return `blogId it isn't correct`;
  }
}

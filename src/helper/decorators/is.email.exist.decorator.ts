import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(email: string) {
    const user = await this.usersRepository.getByUniqueField(email);
    return !user;
  }
  defaultMessage() {
    return `email is already exist`;
  }
}

export function IsEmailExist(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailExistConstraint
    });
  };
}
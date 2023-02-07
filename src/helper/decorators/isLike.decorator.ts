import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';

@ValidatorConstraint()
export class IsLikeConstraint implements ValidatorConstraintInterface {
  validate(like: any, args: ValidationArguments) {
    const availableStatus = ['None', 'Like', 'Dislike'];
    return availableStatus.indexOf(like) !== -1;
  }
  defaultMessage(args: ValidationArguments) {
    return `likeStatus it isn't available like status`;
  }
}

export function IsLike(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLikeConstraint
    });
  };
}

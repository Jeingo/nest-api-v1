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
// @Injectable()
// @ValidatorConstraint({ async: true })
// export class IsBlogIdConstraint implements ValidatorConstraintInterface {
//   constructor(@InjectModel(Blog.name) private blogsModel: IBlogModel) {}
//
//   async validate(blogId: any, args: ValidationArguments) {
//     const blog = await this.blogsModel.findById(new Types.ObjectId(blogId));
//     return !!blog;
//   }
//   defaultMessage(args: ValidationArguments) {
//     return `blogId it isn't correct`;
//   }
// }
//
// export function IsBlogId(validationOptions?: ValidationOptions) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       constraints: [],
//       validator: IsBlogIdConstraint
//     });
//   };
// }

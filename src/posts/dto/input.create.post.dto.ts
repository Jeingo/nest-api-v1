import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { Trim } from '../../helper/pipes/validation.pipe';
import { IsBlogIdConstraint } from '../../helper/pipes/blogId.validator';

export class InputCreatePostDto {
  @MaxLength(30)
  @IsString()
  @IsNotEmpty()
  @Trim()
  title: string;

  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  @Trim()
  shortDescription: string;

  @MaxLength(1000)
  @IsString()
  @IsNotEmpty()
  @Trim()
  content: string;

  @Validate(IsBlogIdConstraint)
  @IsString()
  @IsNotEmpty()
  @Trim()
  blogId: string;
}

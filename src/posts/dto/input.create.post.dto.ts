import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../helper/validation-decorators/to.trim.decorator';
import { IsBlogId } from '../../helper/validation-decorators/is.blog.id.decorator';

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

  @IsBlogId()
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  @Trim()
  blogId: string;
}

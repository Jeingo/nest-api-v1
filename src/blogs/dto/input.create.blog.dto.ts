import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/pipes/validation.pipe';

export class InputCreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  description: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  websiteUrl: string;
}

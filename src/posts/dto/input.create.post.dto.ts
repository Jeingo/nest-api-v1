import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../helper/pipes/validation.pipe';

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

  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  @Trim()
  blogId: string;
}

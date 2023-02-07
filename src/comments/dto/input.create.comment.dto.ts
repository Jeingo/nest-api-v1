import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../helper/pipes/validation.pipe';

export class InputCreateCommentDto {
  @Length(20, 300)
  @IsString()
  @IsNotEmpty()
  @Trim()
  content: string;
}

import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';

export class InputCreateCommentDto {
  @Length(20, 300)
  @IsString()
  @IsNotEmpty()
  @Trim()
  content: string;
}

import { StatusLikeType } from '../../types/types';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/pipes/validation.pipe';
import { IsLike } from '../../helper/decorators/isLike.decorator';

export class InputUpdateLikeDto {
  @IsLike()
  @IsString()
  @IsNotEmpty()
  @Trim()
  likeStatus: StatusLikeType;
}
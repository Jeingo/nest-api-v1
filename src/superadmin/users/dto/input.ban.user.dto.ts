import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from '../../../helper/validation-decorators/to.trim.decorator';

export class InputBanUserDto {
  @IsString()
  @IsNotEmpty()
  isBanned: string;

  @MinLength(20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  banReason: string;
}

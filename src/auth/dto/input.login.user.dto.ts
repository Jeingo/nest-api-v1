import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';

export class InputLoginUserDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  loginOrEmail: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  password: string;
}

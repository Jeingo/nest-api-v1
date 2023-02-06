import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/pipes/validation.pipe';

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

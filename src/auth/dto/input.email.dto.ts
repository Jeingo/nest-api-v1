import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';
import { IsEmailExist } from '../../helper/decorators/is.email.exist.decorator';

export class InputEmailDto {
  @IsEmailExist()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}

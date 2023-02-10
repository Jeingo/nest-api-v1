import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';

export class InputEmailDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}

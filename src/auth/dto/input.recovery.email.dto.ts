import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';

export class InputRecoveryEmailDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';
import { EmailExistAndDontConfirmed } from '../../helper/decorators/email.exist.and.dont.confirmed.decorator';

export class InputEmailDto {
  @EmailExistAndDontConfirmed()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}

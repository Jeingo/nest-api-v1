import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches
} from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';
import { IsLoginExist } from '../../helper/decorators/is.login.exist.decorator';
import { IsEmailNotExist } from '../../helper/decorators/is.email.not.exist.decorator';

export class InputRegistrationUserDto {
  @IsLoginExist()
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(3, 10)
  @IsString()
  @IsNotEmpty()
  @Trim()
  login: string;

  @Length(6, 20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  password: string;

  @IsEmailNotExist()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}

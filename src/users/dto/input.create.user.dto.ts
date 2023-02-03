import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches
} from 'class-validator';
import { Trim } from '../../helper/pipes/validation.pipe';

export class InputCreateUserDto {
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

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}

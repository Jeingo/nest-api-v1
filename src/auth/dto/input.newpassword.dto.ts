import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../helper/pipes/validation.pipe';

export class InputNewPasswordDto {
  @Length(6, 20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  recoveryCode: string;
}

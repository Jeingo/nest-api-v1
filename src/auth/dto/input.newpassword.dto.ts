import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';

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

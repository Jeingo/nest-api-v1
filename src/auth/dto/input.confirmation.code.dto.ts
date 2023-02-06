import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/pipes/validation.pipe';

export class InputConfirmationCodeDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  code: string;
}

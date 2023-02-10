import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';

export class InputConfirmationCodeDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  code: string;
}

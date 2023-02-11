import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../helper/decorators/to.trim.decorator';
import { IsConfirmationCodeCorrect } from '../../helper/decorators/is.confirmation.code.correct.decorator';

export class InputConfirmationCodeDto {
  @IsConfirmationCodeCorrect()
  @IsString()
  @IsNotEmpty()
  @Trim()
  code: string;
}

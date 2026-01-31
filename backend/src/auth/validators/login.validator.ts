import { IsString } from 'class-validator';

export class LoginValidator {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

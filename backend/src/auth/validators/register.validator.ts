import { IsString, MinLength } from 'class-validator';

export class RegisterValidator {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

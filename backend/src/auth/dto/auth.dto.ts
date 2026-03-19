import { createZodDto } from 'nestjs-zod';
import { LoginRequestSchema } from '../validation/login-schema';
import { RegistrationRequestSchema } from '../validation/registration-schema';

export class LoginDto extends createZodDto(LoginRequestSchema) {}
export class RegisterDto extends createZodDto(RegistrationRequestSchema) {}

import { PipeTransform, BadRequestException } from '@nestjs/common';
import * as z from 'zod/v4';

export function createZodValidationPipe<T>(schema: z.ZodSchema<T>) {
  class ZodValidation implements PipeTransform {
    transform(value: any): T {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new BadRequestException(result.error.issues);
      }

      return result.data;
    }
  }

  return new ZodValidation();
}

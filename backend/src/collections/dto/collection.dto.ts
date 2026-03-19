import { createZodDto } from 'nestjs-zod';
import { CreateCollectionRequestSchema } from '../validation/create-collection-request-schema';
import { UpdateCollectionRequestSchema } from '../validation/update-collection-request-schema';

export class CreateCollectionDto extends createZodDto(
  CreateCollectionRequestSchema,
) {}
export class UpdateCollectionDto extends createZodDto(
  UpdateCollectionRequestSchema,
) {}

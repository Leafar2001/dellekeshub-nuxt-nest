import { PartialType } from '@nestjs/mapped-types';
import { CreateMediaValidator } from './create-media.validator';

export class UpdateMediaValidator extends PartialType(CreateMediaValidator) {}

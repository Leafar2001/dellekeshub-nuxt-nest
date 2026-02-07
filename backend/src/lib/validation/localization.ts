import * as z from 'zod/v4';
import { locales } from '../project';

export const LocalizedStringSchema = z.partialRecord(
  z.enum(locales),
  z.string(),
);

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

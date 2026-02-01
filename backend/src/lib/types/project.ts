import * as z from 'zod/v4';

export const locales = ['en-US', 'nl-NL'] as const;
export type Locale = (typeof locales)[number];

export const LocalizedStringSchema = z.partialRecord(
  z.enum(locales),
  z.string(),
);

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

export const imageTypes = ['thumbnail', 'snapshot', 'banner'] as const;
export type ImageType = (typeof imageTypes)[number];

export const collectionTypes = ['movie', 'series'] as const;
export type CollectionType = (typeof collectionTypes)[number];

export const personRoles = ['actor', 'director', 'writer', 'star'] as const;
export type PersonRole = (typeof personRoles)[number];

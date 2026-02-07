export const roles = ['user', 'admin'] as const;
export type Role = (typeof roles)[number];

export const locales = ['en-US', 'nl-NL'] as const;
export type Locale = (typeof locales)[number];

export const imageTypes = ['thumbnail', 'snapshot', 'banner'] as const;
export type ImageType = (typeof imageTypes)[number];

export const collectionTypes = ['movie', 'series'] as const;
export type CollectionType = (typeof collectionTypes)[number];

export const personRoles = ['actor', 'director', 'writer', 'star'] as const;
export type PersonRole = (typeof personRoles)[number];

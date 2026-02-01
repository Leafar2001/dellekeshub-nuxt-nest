import slugify from 'slugify';
import { LocalizedString } from '../types/project';

export function generateSlug(s: string): string {
  return slugify(s);
}

export function generateSlugLocalizedString(
  localizedString: LocalizedString,
): LocalizedString {
  return Object.fromEntries(
    Object.entries(localizedString).map(([key, value]) => [
      key,
      generateSlug(value),
    ]),
  );
}

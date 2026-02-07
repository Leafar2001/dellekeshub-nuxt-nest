import slugify from 'slugify';
import { LocalizedString } from '../validation/localization';

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

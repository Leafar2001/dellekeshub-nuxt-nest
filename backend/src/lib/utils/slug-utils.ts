import slugify from 'slugify';
import { LocalizedString } from '../validation/localization';

export function generateSlug(s: string): string {
  return slugify(s);
}

export function generateSlugLocalizedString(
  localizedString: LocalizedString | undefined,
): LocalizedString | undefined {
  if (!localizedString) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(localizedString).map(([key, value]) => [
      key,
      generateSlug(value),
    ]),
  );
}

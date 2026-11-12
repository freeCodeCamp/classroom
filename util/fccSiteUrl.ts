const DEFAULT_FCC_SITE_URL = 'https://www.freecodecamp.org';

export function getFccSiteUrl(
  env: Record<string, string | undefined> = process.env
): string {
  return (env.FCC_SITE_URL || DEFAULT_FCC_SITE_URL).replace(/\/+$/, '');
}

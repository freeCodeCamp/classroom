import { describe, expect, it } from 'vitest';
import { getFccSiteUrl } from '../../util/fccSiteUrl';

describe('getFccSiteUrl', () => {
  it('defaults to the production freeCodeCamp site', () => {
    expect(getFccSiteUrl({})).toBe('https://www.freecodecamp.org');
  });

  it('uses FCC_SITE_URL when it is set', () => {
    expect(
      getFccSiteUrl({ FCC_SITE_URL: 'https://www.freecodecamp.dev' })
    ).toBe('https://www.freecodecamp.dev');
  });

  it('removes trailing slashes', () => {
    expect(
      getFccSiteUrl({ FCC_SITE_URL: 'https://www.freecodecamp.dev//' })
    ).toBe('https://www.freecodecamp.dev');
  });

  it('treats an empty FCC_SITE_URL as not set', () => {
    expect(getFccSiteUrl({ FCC_SITE_URL: '' })).toBe(
      'https://www.freecodecamp.org'
    );
  });
});

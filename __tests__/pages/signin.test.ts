import { afterEach, describe, expect, it } from 'vitest';
import { getServerSideProps } from '../../pages/signin';
import type { GetServerSidePropsContext } from 'next';

const createContext = (query: Record<string, string | string[]> = {}) =>
  ({ query }) as unknown as GetServerSidePropsContext;

const getProps = async (query: Record<string, string | string[]> = {}) => {
  const result = await getServerSideProps(createContext(query));
  if (!('props' in result)) {
    throw new Error('Expected props');
  }
  return await result.props;
};

describe('signin getServerSideProps', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('devLogin', () => {
    it('is true in development when the flag is true', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('FCC_ENABLE_DEV_LOGIN_MODE', 'true');
      expect((await getProps()).devLogin).toBe(true);
    });

    it('is false in production even when the flag is true', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('FCC_ENABLE_DEV_LOGIN_MODE', 'true');
      expect((await getProps()).devLogin).toBe(false);
    });

    it('is false in development when the flag is unset', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('FCC_ENABLE_DEV_LOGIN_MODE', undefined);
      expect((await getProps()).devLogin).toBe(false);
    });
  });

  describe('callbackUrl', () => {
    it('keeps a same-origin path', async () => {
      vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3001');
      expect((await getProps({ callbackUrl: '/classes' })).callbackUrl).toBe(
        '/classes'
      );
    });

    it('falls back to / for a foreign origin', async () => {
      vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3001');
      expect(
        (await getProps({ callbackUrl: 'https://evil.example' })).callbackUrl
      ).toBe('/');
    });
  });

  describe('error', () => {
    it('passes a string error through', async () => {
      expect((await getProps({ error: 'OAuthAccountNotLinked' })).error).toBe(
        'OAuthAccountNotLinked'
      );
    });

    it('is null when absent', async () => {
      expect((await getProps()).error).toBeNull();
    });

    it('is null for an array error', async () => {
      expect((await getProps({ error: ['a', 'b'] })).error).toBeNull();
    });
  });
});

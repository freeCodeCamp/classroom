import { describe, expect, it } from 'vitest';
import { assertEnv, findEnvProblems } from '../../util/env';

const developmentEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://test-user:test-pass@localhost:5432/test',
  NEXTAUTH_URL: 'http://localhost:3001',
  NEXTAUTH_SECRET: 'example-not-for-production'
};

const productionEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://test-user:test-pass@localhost:5432/test',
  NEXTAUTH_URL: 'https://example.org',
  NEXTAUTH_SECRET: 'test-production-secret',
  AUTH0_DOMAIN: 'example.auth0.com',
  AUTH0_CLIENT_ID: 'test-client-id',
  AUTH0_CLIENT_SECRET: 'test-client-secret',
  // TODO: replace with the real freeCodeCamp API URL once it is confirmed
  FCC_API_URL: 'https://api.example.org'
};

describe('findEnvProblems', () => {
  it('returns no problems for a development env without AUTH0 values', () => {
    expect(findEnvProblems(developmentEnv)).toEqual([]);
  });

  it('reports DATABASE_URL when it is missing in development', () => {
    const env: NodeJS.ProcessEnv = {
      ...developmentEnv,
      DATABASE_URL: undefined
    };
    expect(findEnvProblems(env)).toEqual(['DATABASE_URL is not set']);
  });

  it.each(['NEXTAUTH_URL', 'NEXTAUTH_SECRET'])(
    'reports %s when it is missing',
    name => {
      const env: NodeJS.ProcessEnv = { ...developmentEnv, [name]: undefined };
      expect(findEnvProblems(env)).toEqual([`${name} is not set`]);
    }
  );

  it('treats an unset NODE_ENV as development', () => {
    const env: NodeJS.ProcessEnv = { ...developmentEnv };
    Reflect.deleteProperty(env, 'NODE_ENV');
    expect(findEnvProblems(env)).toEqual([]);
  });

  it('treats an empty string as not set', () => {
    const env: NodeJS.ProcessEnv = { ...developmentEnv, DATABASE_URL: '' };
    expect(findEnvProblems(env)).toEqual(['DATABASE_URL is not set']);
  });

  it('requires the three AUTH0 values in production', () => {
    const env: NodeJS.ProcessEnv = {
      ...productionEnv,
      AUTH0_DOMAIN: undefined,
      AUTH0_CLIENT_ID: undefined,
      AUTH0_CLIENT_SECRET: undefined
    };
    expect(findEnvProblems(env)).toEqual([
      'AUTH0_DOMAIN is not set',
      'AUTH0_CLIENT_ID is not set',
      'AUTH0_CLIENT_SECRET is not set'
    ]);
  });

  it('requires FCC_API_URL in production', () => {
    const env: NodeJS.ProcessEnv = { ...productionEnv, FCC_API_URL: undefined };
    expect(findEnvProblems(env)).toEqual(['FCC_API_URL is not set']);
  });

  it('rejects dev login mode in production', () => {
    const env: NodeJS.ProcessEnv = {
      ...productionEnv,
      FCC_ENABLE_DEV_LOGIN_MODE: 'true'
    };
    expect(findEnvProblems(env)).toEqual([
      'Dev login mode must be disabled in production'
    ]);
  });

  it('allows dev login mode in development without AUTH0 values', () => {
    const env: NodeJS.ProcessEnv = {
      ...developmentEnv,
      FCC_ENABLE_DEV_LOGIN_MODE: 'true'
    };
    expect(findEnvProblems(env)).toEqual([]);
  });

  it('rejects the sample NEXTAUTH_SECRET in production', () => {
    const env: NodeJS.ProcessEnv = {
      ...productionEnv,
      NEXTAUTH_SECRET: 'example-not-for-production'
    };
    expect(findEnvProblems(env)).toEqual([
      'NEXTAUTH_SECRET still has the .env.sample value'
    ]);
  });

  it('does not report the sample value when NEXTAUTH_SECRET is missing in production', () => {
    const env: NodeJS.ProcessEnv = {
      ...productionEnv,
      NEXTAUTH_SECRET: undefined
    };
    expect(findEnvProblems(env)).toEqual(['NEXTAUTH_SECRET is not set']);
  });

  it('returns no problems for a complete production env', () => {
    expect(findEnvProblems(productionEnv)).toEqual([]);
  });

  it('rejects an AUTH0_DOMAIN with a scheme', () => {
    const env: NodeJS.ProcessEnv = {
      ...productionEnv,
      AUTH0_DOMAIN: 'https://example.auth0.com'
    };
    expect(findEnvProblems(env)).toEqual([
      'AUTH0_DOMAIN must be a host name, without https:// or a path'
    ]);
  });

  it('rejects an AUTH0_DOMAIN with a trailing slash', () => {
    const env: NodeJS.ProcessEnv = {
      ...developmentEnv,
      AUTH0_DOMAIN: 'example.auth0.com/'
    };
    expect(findEnvProblems(env)).toEqual([
      'AUTH0_DOMAIN must be a host name, without https:// or a path'
    ]);
  });
});

describe('assertEnv', () => {
  it('throws an Error that contains every problem', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'development',
      NEXTAUTH_URL: developmentEnv.NEXTAUTH_URL
    };
    expect(() => assertEnv(env)).toThrow(Error);
    expect(() => assertEnv(env)).toThrow('Invalid environment');
    expect(() => assertEnv(env)).toThrow('DATABASE_URL is not set');
    expect(() => assertEnv(env)).toThrow('NEXTAUTH_SECRET is not set');
  });

  it('does not throw when there are no problems', () => {
    expect(() => assertEnv(developmentEnv)).not.toThrow();
  });
});

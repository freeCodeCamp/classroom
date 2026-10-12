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
  AUTH0_CLIENT_ID: 'test-client-id',
  AUTH0_CLIENT_SECRET: 'test-client-secret',
  AUTH0_ISSUER: 'https://example.auth0.com'
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

  it('treats an empty string as not set', () => {
    const env: NodeJS.ProcessEnv = { ...developmentEnv, DATABASE_URL: '' };
    expect(findEnvProblems(env)).toEqual(['DATABASE_URL is not set']);
  });

  it('requires the three AUTH0 values in production', () => {
    const env: NodeJS.ProcessEnv = {
      ...productionEnv,
      AUTH0_CLIENT_ID: undefined,
      AUTH0_CLIENT_SECRET: undefined,
      AUTH0_ISSUER: undefined
    };
    expect(findEnvProblems(env)).toEqual([
      'AUTH0_CLIENT_ID is not set',
      'AUTH0_CLIENT_SECRET is not set',
      'AUTH0_ISSUER is not set'
    ]);
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

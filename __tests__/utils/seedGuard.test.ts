import { describe, expect, it } from 'vitest';
import { findSeedProblem } from '../../util/seedGuard';

const localUrl = 'postgresql://postgres:password@localhost:5432/classroom';

describe('findSeedProblem', () => {
  it('allows a localhost database outside production', () => {
    expect(findSeedProblem({ DATABASE_URL: localUrl })).toBeNull();
  });

  it('allows a 127.0.0.1 database', () => {
    expect(
      findSeedProblem({
        DATABASE_URL: 'postgresql://postgres:password@127.0.0.1:5432/classroom'
      })
    ).toBeNull();
  });

  it('refuses when NODE_ENV is production', () => {
    expect(
      findSeedProblem({ NODE_ENV: 'production', DATABASE_URL: localUrl })
    ).toBe('The seed does not run when NODE_ENV is production');
  });

  it('refuses a database on another host', () => {
    expect(
      findSeedProblem({
        DATABASE_URL: 'postgresql://user:pass@db.example.com:5432/classroom'
      })
    ).toBe('The seed runs only against a database on localhost');
  });

  it('refuses when DATABASE_URL is missing', () => {
    expect(findSeedProblem({})).toBe('DATABASE_URL is not set');
  });

  it('refuses when DATABASE_URL is not a URL', () => {
    expect(findSeedProblem({ DATABASE_URL: 'not a url' })).toBe(
      'DATABASE_URL is not a valid URL'
    );
  });
});

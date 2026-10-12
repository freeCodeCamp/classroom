import { getAppBaseUrl } from '../../util/getAppBaseUrl';

describe('getAppBaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CLASSROOM_APP_BASE_URL;
    delete process.env.NEXTAUTH_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const req = {
    headers: { host: 'proxy.internal', 'x-forwarded-proto': 'http' }
  };

  it('prefers CLASSROOM_APP_BASE_URL over the request host', () => {
    process.env.CLASSROOM_APP_BASE_URL = 'https://classroom.freecodecamp.org';
    process.env.NEXTAUTH_URL = 'https://auth.example.org';

    expect(getAppBaseUrl(req)).toBe('https://classroom.freecodecamp.org');
  });

  it('falls back to NEXTAUTH_URL', () => {
    process.env.NEXTAUTH_URL = 'https://classroom.freecodecamp.org/';

    expect(getAppBaseUrl(req)).toBe('https://classroom.freecodecamp.org');
  });

  it('falls back to the request host when nothing is configured', () => {
    expect(
      getAppBaseUrl({
        headers: { host: 'localhost:3001', 'x-forwarded-proto': 'https' }
      })
    ).toBe('https://localhost:3001');
    expect(getAppBaseUrl({ headers: { host: 'localhost:3001' } })).toBe(
      'http://localhost:3001'
    );
  });

  it('uses localhost when there is no request or configuration', () => {
    expect(getAppBaseUrl()).toBe('http://localhost:3001');
  });
});

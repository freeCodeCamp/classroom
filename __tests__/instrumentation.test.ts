import { register } from '../instrumentation';

const validEnv = {
  DATABASE_URL: 'postgresql://test-user:test-pass@localhost:5432/test',
  NEXTAUTH_URL: 'http://localhost:3001',
  NEXTAUTH_SECRET: 'example-not-for-production'
};

describe('register', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...validEnv, NODE_ENV: 'test', NEXT_RUNTIME: 'nodejs' };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('exits with code 1 when the environment is invalid', async () => {
    delete process.env.DATABASE_URL;

    await register();

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('starts when the environment is valid', async () => {
    await register();

    expect(process.exit).not.toHaveBeenCalled();
  });

  it('skips the check outside the Node.js runtime', async () => {
    process.env.NEXT_RUNTIME = 'edge';
    delete process.env.DATABASE_URL;

    await register();

    expect(process.exit).not.toHaveBeenCalled();
  });
});

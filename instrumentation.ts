export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertEnv } = await import('./util/env');
    try {
      assertEnv({ ...process.env, NODE_ENV: process.env.NODE_ENV });
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
}

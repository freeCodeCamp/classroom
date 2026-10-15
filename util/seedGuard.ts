const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function findSeedProblem(
  env: Partial<NodeJS.ProcessEnv>
): string | null {
  if (env.NODE_ENV === 'production') {
    return 'The seed does not run when NODE_ENV is production';
  }

  if (!env.DATABASE_URL) {
    return 'DATABASE_URL is not set';
  }

  let hostname: string;
  try {
    hostname = new URL(env.DATABASE_URL).hostname;
  } catch {
    return 'DATABASE_URL is not a valid URL';
  }

  if (!LOCAL_HOSTS.has(hostname)) {
    return 'The seed runs only against a database on localhost';
  }

  return null;
}

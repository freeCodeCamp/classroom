const SAMPLE_SECRET = 'example-not-for-production';
const MIN_SECRET_LENGTH = 32;

const ALWAYS_REQUIRED: string[] = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

const PRODUCTION_REQUIRED: string[] = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'FCC_API_URL',
  'TPA_API_BEARER_TOKEN'
];

export function findEnvProblems(env: NodeJS.ProcessEnv): string[] {
  const isProduction = env.NODE_ENV === 'production';
  const required = isProduction
    ? [...ALWAYS_REQUIRED, ...PRODUCTION_REQUIRED]
    : ALWAYS_REQUIRED;

  const problems = required
    .filter(name => !env[name])
    .map(name => `${name} is not set`);

  if (env.AUTH0_DOMAIN && /[/:]/.test(env.AUTH0_DOMAIN)) {
    problems.push(
      'AUTH0_DOMAIN must be a host name, without https:// or a path'
    );
  }

  if (isProduction && env.NEXTAUTH_SECRET === SAMPLE_SECRET) {
    problems.push('NEXTAUTH_SECRET still has the .env.sample value');
  } else if (
    isProduction &&
    env.NEXTAUTH_SECRET &&
    env.NEXTAUTH_SECRET.length < MIN_SECRET_LENGTH
  ) {
    problems.push(
      `NEXTAUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters`
    );
  }

  for (const name of ['NEXTAUTH_URL', 'FCC_API_URL']) {
    const value = env[name];
    if (isProduction && value && !value.startsWith('https://')) {
      problems.push(`${name} must start with https:// in production`);
    }
  }

  if (isProduction && env.DANGEROUS_ACCOUNT_LINKING_ENABLED === 'true') {
    problems.push('Dangerous account linking must be disabled in production');
  }

  if (isProduction && env.FCC_ENABLE_DEV_LOGIN_MODE === 'true') {
    problems.push('Dev login mode must be disabled in production');
  }

  return problems;
}

export function assertEnv(env: NodeJS.ProcessEnv = process.env): void {
  const problems = findEnvProblems(env);
  if (problems.length > 0) {
    throw new Error(`Invalid environment:\n- ${problems.join('\n- ')}`);
  }
}

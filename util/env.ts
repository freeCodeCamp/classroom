const SAMPLE_SECRET = 'example-not-for-production';

const ALWAYS_REQUIRED: string[] = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

const PRODUCTION_REQUIRED: string[] = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET'
];

export function findEnvProblems(env: NodeJS.ProcessEnv): string[] {
  const isProduction = env.NODE_ENV === 'production';
  const required = isProduction
    ? [...ALWAYS_REQUIRED, ...PRODUCTION_REQUIRED]
    : ALWAYS_REQUIRED;

  const problems = required
    .filter(name => !env[name])
    .map(name => `${name} is not set`);

  if (isProduction && env.NEXTAUTH_SECRET === SAMPLE_SECRET) {
    problems.push('NEXTAUTH_SECRET still has the .env.sample value');
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

import { copyFileSync, existsSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';

function run(command: string, args: string[]): void {
  // On Windows, pnpm installed through npm is a .cmd shim, which Node can only
  // spawn through a shell. The arguments are fixed strings, so joining is safe.
  if (process.platform === 'win32') {
    execSync([command, ...args].join(' '), { stdio: 'inherit' });
  } else {
    execFileSync(command, args, { stdio: 'inherit' });
  }
}

if (!existsSync('.env')) {
  copyFileSync('.env.sample', '.env');
  console.log('Created .env from .env.sample');
}

if (process.env.CLASSROOM_DEVCONTAINER !== 'true') {
  run('docker', ['compose', 'up', '--detach', '--wait']);
}

run('pnpm', ['exec', 'prisma', 'migrate', 'deploy']);
run('pnpm', ['exec', 'prisma', 'db', 'seed']);

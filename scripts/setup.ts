import { copyFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

function run(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: 'inherit' });
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

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

[[ -f .env ]] || cp .env.sample .env

pnpm exec prisma migrate deploy
pnpm exec prisma db seed

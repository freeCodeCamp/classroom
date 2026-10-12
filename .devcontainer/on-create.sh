#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

sudo chown node:node node_modules

npm install --global "$(node -p "require('./package.json').packageManager")"
pnpm install --frozen-lockfile

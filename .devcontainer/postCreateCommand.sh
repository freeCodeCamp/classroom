#!/bin/bash -xe
export NVM_DIR="/usr/local/share/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
cp --no-clobber .env.sample .env

# Uncomment to use lts (long-term support)
# nvm install --lts
# nvm alias default 'lts/*'

# Use Node.js 18.16.1
# nvm install 18.16.1
# nvm alias default '18.16.1'

# Use Node.js 16.20.0
nvm install 16.20.0
nvm alias default '16.20.0'

nvm use default
npm ci --prefer-offline --no-audit --no-progress
npx prisma generate
npx prisma db push
npx prisma db seed

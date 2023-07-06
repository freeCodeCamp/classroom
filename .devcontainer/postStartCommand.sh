#!/bin/bash -xe
export NVM_DIR="/usr/local/share/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
cp .env.sample .env &&
nvm install 16.20.0 &&
nvm alias default 16.20.0 &&
npm ci --no-audit --no-progress &&
npx prisma generate &&
npx prisma db push &&
npx prisma db seed

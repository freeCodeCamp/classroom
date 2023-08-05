#!/bin/bash -xe

# Install gh CLI
# https://github.com/cli/cli/blob/trunk/docs/install_linux.md#debian-ubuntu-linux-raspberry-pi-os-apt
type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
&& sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y

# Install PostgreSQL client in this `app` container
sudo apt update
sudo apt-get install -y postgresql-client

# There are two containers, app and db
#
# PostgreSQL client is in this app container
#
# PostgreSQL server is in the db container
#
# No need to install PostgreSQL server in this app container
# because PostgreSQL server is already running in the db container
#
# The db container's port, TCP 5432, is already forwarded to this app container
#
# Please see devcontainer.json and docker-compose.yml for details

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

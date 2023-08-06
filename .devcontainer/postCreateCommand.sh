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
sudo apt-get install -y postgresql-client

# Whereas installing PostgreSQL server via
# sudo apt-get install -y postgresql
# sudo service postgresql start
# would be redundant because there is already a db container that runs PostgreSQL on TCP port 5432.
#
# The app container does not need to install and start the PostgreSQL service inside itself
# because it can connect to the db container's PostgreSQL database through the forwarded port.
#
# The GitHub Codespaces environment has two containers running simultaneously:
# 1. An app container that runs the code you are developing.
# 2. A db container that runs the PostgreSQL database that your code needs to connect to.
#
# The app and db containers are configured in the .devcontainer/docker-compose.yml file.
# which uses the postgres:latest image to create a db container that runs PostgreSQL on TCP port 5432.
#
# The app container then uses the forwardPorts property in .devcontainer/devcontainer.json
# to forward PostgreSQL's TCP 5432 port to its own local port 5432.
#
# This means that you can connect to the PostgreSQL database
# from your local machine by connecting to localhost:5432.
#
# Here is a diagram that illustrates the two containers and the forwarded port:
#
#                                                                    localhost:5432
#                                                                    ^
#                                                                    |
# app container (your code) <-- forwarded port 5432 --> db container (PostgreSQL)
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

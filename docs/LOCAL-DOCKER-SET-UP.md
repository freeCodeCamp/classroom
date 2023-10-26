# Local Docker Setup Instructions

Docker based setup **requires** Linux, macOS, etc. If you have not used docker before, we recommend reading Docker documentation to familiarize yourself.

- [Getting Started with Docker](https://docs.docker.com/get-started/)

## Step 1: Make sure you have Docker installed

You will need to have Docker on your local machine to create the enviornment. Please refer to the docs to [install docker](https://docs.docker.com/get-docker/) if you do not have it already.

## Step 2: Prepare the database

This project uses a [PostgreSQL](https://www.postgresql.org/) database. You can use the below commands for a docker-based setup on likes of Linux or macOS.

### Set up Docker

```console
# create a directory for the data
mkdir -p $HOME/docker/volumes/postgres

# start a container (this will use the "latest" tag. Use the version as needed)
docker run -it --name pgsql-classroom -e POSTGRES_PASSWORD=password -d --restart unless-stopped -p 5432:5432 -v $HOME/docker/volumes/postgres:/var/lib/postgresql/data postgres:latest

# change DATABASE_URL in your .env to
postgresql://postgres:password@localhost:5432/classroom
```

## Step 3: Get the code

1. Clone the project repository.
   ```console
   git clone https://github.com/freeCodeCamp/classroom.git
   cd classroom
   ```
2. We use npm (specifically npm workspaces) to manage our dependencies.
   ```console
   npm ci
   ```
3. Create `.env` file based on the `.env.sample` file. Theses are the environment variables that are used by the application.

## Step 4: Set up a NextAuth Provider App

You need to set up a NextAuth Provider and run the app.

For dev environments, we have enabled use of the Github Provider. Please read and follow their [guide](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) to set up the oauth app.

## Step 5: Update .env file

You will need to update the .env file inside your project with the following:

- Set DataBase Url to:
  `postgresql://postgres:password@localhost:5432/classroom`
- Set mock user data URL to:  
  `http://localhost:3001/data`

- Set NEXTAUTH_URL to:
  `http://localhost:3000`

- Set GITHUB_ID to:
  - Your Client ID is shown in the OAuth app page (generated at step 4). Copy and paste to GITHUB_ID.
- Set GITHUB_SECRET to:
  - Generate a **new** Client Secret. Then copy and paste to GITHUB_SECRET.

## Additional Steps to take after finishing Local Docker Setup:

1. Run the following commands in terminal to start your application.

```console
  npx prisma generate
  npx prisma db push
  npx prisma db seed
  npm run develop
```

2. Open a new terminal to feed in the mock student information being used.

```console
   npm run mock-fcc-data
```

3. Open another terminal and start the ORM tool, [Prisma Studio](https://www.prisma.io/docs/concepts/overview/what-is-prisma).

```console
   npx prisma studio
```

Happy Coding!

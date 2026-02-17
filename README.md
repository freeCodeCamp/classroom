[![freeCodeCamp Social Banner](https://s3.amazonaws.com/freecodecamp/wide-social-banner.png)](https://www.freecodecamp.org/)

[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![first-timers-only Friendly](https://img.shields.io/badge/first--timers--only-friendly-blue.svg)](http://www.firsttimersonly.com/)

[freeCodeCamp.org](https://www.freecodecamp.org) is a friendly community where you can learn to code for free. It is run by a [donor-supported 501(c)(3) nonprofit](https://www.freecodecamp.org/donate) to help millions of busy adults transition into tech. Our community has already helped more than 40,000 people get their first developer job. Our full-stack web development and machine learning curriculum is completely free and self-paced. We have thousands of interactive coding challenges to help you expand your skills.

# Classroom

> A self-hosted solution to help teachers plan and manage classroom-based learning, on top of freeCodeCamp's learning platform.

## Motivation

For a while now teachers have been asking for a way to get a birds eye view of multiple students who are progressing through the course. This is why we set out to make freeCodeCamp classroom mode, an interactive dashboard for teachers to view multiple freeCodeCamp users’ progress on their courses.

## Contributing

### Optional - GitHub Codespaces Environment

If you have used GitHub Codespaces in other projects, doing the same in freeCodeCamp Classroom should be straightforward.

- https://docs.github.com/en/codespaces/overview

- https://docs.github.com/en/codespaces/getting-started

- If you want a ready-made dev environment in your browser, make a fork of this repository.

- Afterward, set up your NextAuth-related environment variables in the `.env` file.

- Please follow the "Setup Instructions" in the terminal for more information.

Within freeCodeCamp Classroom, GitHub Codespaces is on par with Gitpod so that you can use either.

This [video](https://www.loom.com/share/37dcb9555ad642618d82619277daaa38?sid=c17189b2-5798-44c9-8b74-38749f3578e1) walks through the setup process on Github Codespaces. Note that this video was recorded on Feb 10, 2025. It is not guaranteed to be up to date with any new setup instructions added after that date.

### Optional - GitPod Dev Environment

If you want a ready-made dev environment in your browser, make a fork of this repository and then prefix your fork with "gitpod.io/#". For example,

`gitpod.io/#https://github.com/{your-github-user-name}/classroom`

You will still need to setup your NextAuth-related environment variables in the .env file.
For more information, please follow the "Setup Instructions" in the terminal.
For setting up locally, follow the instructions below.

### Styling a component

We recommend styling components using our [design style guide](https://design-style-guide.freecodecamp.org/).

We are strongly opinionated about adding new variables/tokens to the colors. After careful research, the colors have been chosen to respect the freeCodeCamp brand identity, developer experience, and accessibility.

### System Design and Architecture

![System Diagram](https://github.com/freeCodeCamp/classroom/assets/44416323/8278d34f-af4d-48a0-bc2e-7f30c5ad011a)

We recommend going through our [system design diagram](https://www.canva.com/design/DAFo8ezu7W8/EfUE0hjSDuJHFRGnG9NOvQ/edit?utm_content=DAFo8ezu7W8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton).

### Prepare the database

This project uses a [PostgreSQL](https://www.postgresql.org/) database. You should follow the instructions in the linked documentation to set it up for your system. Alternatively, you can use the below commands for a docker-based setup on likes of Linux or macOS, if you have docker installed.

<details>

<summary>Docker based setup on Linux, macOS, etc.</summary>

```console
# create a directory for the data
mkdir -p $HOME/docker/volumes/postgres

# start a container (this will use the "latest" tag. Use the version as needed)
docker run -it --name pgsql-classroom -e POSTGRES_PASSWORD=password -d --restart unless-stopped -p 5432:5432 -v $HOME/docker/volumes/postgres:/var/lib/postgresql/data postgres:latest

# change DATABASE_URL in your .env to
postgresql://postgres:password@localhost:5432/classroom
```

</details>

### Get the code

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
4. Run `npx prisma generate`.
5. Run `npx prisma db push`.
6. Run `npx prisma db seed`.
7. Run `npm run develop`.
8. Run `npm run mock-fcc-data`
9. Run `npx prisma studio`

### Challenge map (FCC Proper)

The challenge map is built from the FCC Proper GraphQL curriculum database and
saved to `data/challengeMap.json`. We recommend regenerating it about once per
week so it stays aligned with upstream curriculum updates.

To generate or refresh the map:

```console
node scripts/build-challenge-map-graphql.mjs
```

To run the challenge map tests (they read the current `data/challengeMap.json`):

```console
npm run test:challenge-map
```

**Note:** The classroom app runs on port 3001 and mock data on port 3002 to avoid conflicts with freeCodeCamp's main platform (ports 3000/8000).

Need more help? Ran into issues? Check out this [guide](https://docs.google.com/document/d/1apfjzfIwDAfg6QQf2KD1E1aeD-KU7DEllwnH9Levq4A/edit) that walks you through all the steps of setting up the repository locally, without Docker.

---

### Authentication Setup

The Classroom application supports two authentication providers: **GitHub OAuth** (recommended for contributors) and **Auth0** (required for production). You must configure at least one provider to use the application.

For FCC Proper integration, install the application locally and use Auth0 for authentication.

#### GitHub OAuth Setup (Recommended for Development)

1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Click "New OAuth App" and fill in:
   - **Application name**: FreeCodeCamp Classroom (or your preferred name)
   - **Homepage URL**: `http://localhost:3001` (or the URL shown in your terminal)
   - **Authorization callback URL**: `http://localhost:3001/api/auth/callback/github`
3. After creating the app, copy the Client ID and Client Secret to your `.env` file:
   ```
   GITHUB_ID=your_client_id_here
   GITHUB_SECRET=your_client_secret_here
   GITHUB_OAUTH_PROVIDER_ENABLED=true
   ```

#### Auth0 Setup (Production & Advanced Development)

**Important:** Auth0 callback URLs must exactly match your application URL including the port number. After changing ports, you must update your Auth0 application settings.

##### Creating an Auth0 Application

1. Go to [auth0.com](https://auth0.com/) and create an account (or sign in)
2. Click "Create Application" and select "Regular Web Applications"
3. Select "Next.js" as your technology
4. Navigate to the "Settings" tab (do NOT follow the "integrate with my app" tutorial)

##### Auth0 Configuration Mapping

Copy the following values from your Auth0 Application Settings to your `.env` file:

| Auth0 Setting | .env Variable         | Example Value                                        |
| ------------- | --------------------- | ---------------------------------------------------- |
| Client ID     | `AUTH0_CLIENT_ID`     | `abcdefghijklmnopqrstuvwxyz0123456789`               |
| Client Secret | `AUTH0_CLIENT_SECRET` | `abcdefghijklmnopqrstuvwxyz0123456789-LONGER_STRING` |
| Domain        | `AUTH0_ISSUER`        | `https://your-tenant.us.auth0.com`                   |

**Note:** Do NOT include a trailing slash in `AUTH0_ISSUER`.

##### Auth0 Application URLs (Critical for Port Changes)

In your Auth0 Application Settings, configure these URLs based on your environment:

**For Local Development (localhost:3001):**

| Auth0 Setting         | Value                                           |
| --------------------- | ----------------------------------------------- |
| Allowed Callback URLs | `http://localhost:3001/api/auth/callback/auth0` |
| Allowed Logout URLs   | `http://localhost:3001`                         |

**For GitHub Codespaces:**

| Auth0 Setting         | Value                                                                  |
| --------------------- | ---------------------------------------------------------------------- |
| Allowed Callback URLs | `https://{CODESPACE_NAME}-3001.app.github.dev/api/auth/callback/auth0` |
| Allowed Logout URLs   | `https://{CODESPACE_NAME}-3001.app.github.dev`                         |

**Note:** Auth0 allows multiple callback URLs separated by commas. You can add all your development environments to support seamless switching.

##### Running with freeCodeCamp Proper Locally

If you need to run Classroom alongside freeCodeCamp's main platform (fCC Proper) on the same machine:

**Prerequisites:**

- Both applications MUST run on the same domain (`localhost`) for authentication to work correctly
- Both applications MUST be installed locally (Codespaces/Gitpod won't work for this setup)
- Port separation is **required** to avoid conflicts

**Port Configuration:**

- fCC Proper: `localhost:8000` (frontend) + `localhost:3000` (backend)
- Classroom: `localhost:3001` (app) + `localhost:3002` (mock data)

**Auth0 Configuration for local FCC Proper integration with local FCC Classroom - Dual Setup:**

Add BOTH callback URLs to your Auth0 Application Settings:

| Auth0 Setting         | Value                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Allowed Callback URLs | `http://localhost:3000/auth/auth0/callback, http://localhost:3001/api/auth/callback/auth0` |
| Allowed Logout URLs   | `http://localhost:3000, http://localhost:3001`                                             |

**Why This Matters:**

- Authentication tokens/sessions are domain-scoped
- `localhost:3000` and `localhost:3001` share the same domain (`localhost`)
- This allows both apps to access the same Auth0 session
- Different domains (e.g., Codespaces URLs) would NOT share authentication state

##### Debugging Authentication Issues

**If authentication fails:**

1. Check Auth0 logs in the dashboard for detailed error messages
2. Verify your `.env` file URLs match your current environment
3. Inspect browser network tab for failed `authorize` requests:
   - Press `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac)
   - Go to Network tab
   - Look for failed (red) `authorize` requests
   - Click on it and check "Preview" to see the expected callback URL
4. Ensure all Auth0 Application Settings are saved (scroll to bottom of settings page)
5. Verify the email used for Auth0 matches your GitHub account email

**Common Issues:**

- **"Callback URL mismatch"**: Your Auth0 Allowed Callback URLs don't include the exact URL being used
- **"Invalid state"**: Session/cookie issue, try clearing cookies for localhost
- **401 Unauthorized**: Check that `NEXTAUTH_SECRET` is set in your `.env` file

##### Production Deployment Notes

In production environments with separate domains (e.g., `classroom.freecodecamp.org` and `freecodecamp.org`):

- Port numbers are handled by reverse proxies (external port 80/443)
- Auth0 callback URLs use domain names, not ports: `https://classroom.freecodecamp.org/api/auth/callback/auth0`
- No port conflicts occur because domains are different
- The port changes in this repository are primarily for local development

---

### Join us in our [Discord Chat](https://discord.gg/qcynkd4Edx) here.

---

### Terminology

freeCodeCamp uses the following terms:

Certification = 'superblock'

Course(s) = 'blocks'

Everything under a course/block is a 'challenge'

---

### Tech stack learning resources

Testing with jest
https://jestjs.io/docs/snapshot-testing

Next.js fullstack framework
https://nextjs.org/docs/pages/building-your-application/optimizing/testing#jest-and-react-testing-library
https://dillionmegida.com/p/nextjs-main-concepts/
https://blog.devgenius.io/advanced-next-js-concepts-8439a8752597

Next.js terminology:

SSR - Server Side Rendering

SSG - Static Site Generation

ISR - Incremental Static Regeneration

CSR - Client Side Rendering

SSR is probably the focus point.

https://dev.to/mbaljeetsingh/what-is-csr-ssr-ssg-isr-different-rendering-strategies-and-which-framework-does-it-better-angular-react-vue-4lkp

---

### License

Copyright © 2021 freeCodeCamp.org

The content of this repository is bound by the following licenses:

- The computer software is licensed under the [BSD-3-Clause](LICENSE.md) license.

[![freeCodeCamp Social Banner](https://s3.amazonaws.com/freecodecamp/wide-social-banner.png)](https://www.freecodecamp.org/)

[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![first-timers-only Friendly](https://img.shields.io/badge/first--timers--only-friendly-blue.svg)](http://www.firsttimersonly.com/)

[freeCodeCamp.org](https://www.freecodecamp.org) is a friendly community where you can learn to code for free. It is run by a [donor-supported 501(c)(3) nonprofit](https://www.freecodecamp.org/donate) to help millions of busy adults transition into tech. Our community has already helped more than 40,000 people get their first developer job. Our full-stack web development and machine learning curriculum is completely free and self-paced. We have thousands of interactive coding challenges to help you expand your skills.

# Classroom

> A self-hosted solution to help teachers plan and manage classroom-based learning, on top of freeCodeCamp's learning platform.

## Motivation

For a while now teachers have been asking for a way to get a birds eye view of multiple students who are progressing through the course. This is why we set out to make freeCodeCamp classroom mode, an interactive dashboard for teachers to view multiple freeCodeCamp users’ progress on their courses.

## Contributing

### Set up the development environment

You can use GitHub Codespaces, a local dev container, or your own machine.

#### Option 1: GitHub Codespaces or a dev container

1. Fork this repository.
1. Open the fork in GitHub Codespaces, or open it in VS Code with "Dev Containers: Reopen in Container".
1. Wait for the setup to complete. The container installs the dependencies, starts Postgres and Mailpit, and seeds the database.
1. Start the app and the mock freeCodeCamp data server in two terminals:
   ```console
   pnpm run develop
   pnpm run mock-fcc-data
   ```

#### Option 2: Your own machine

**Prerequisites:**

- Node.js 26. The version is in `.nvmrc`. If you use fnm or nvm, run `fnm use` or `nvm use` in the project folder.
- pnpm 12. The version is in the `packageManager` field of `package.json`. To install it, run `npm install --global pnpm@12`.
- Docker with Docker Compose.

**Steps:**

1. Clone your fork and install the dependencies:

   ```console
   git clone https://github.com/<your-username>/classroom.git
   cd classroom
   pnpm install
   ```

1. Run the setup:

   ```console
   pnpm run setup
   ```

   This command does these steps:

   - It copies `.env.sample` to `.env` if `.env` does not exist.
   - It starts Postgres and Mailpit from `docker-compose.yml`.
   - It applies the database migrations and seeds the database.

   You can run it again at any time. It does not change an existing `.env`. It resets the seed users and the seed classroom, and keeps all other data.

1. Start the app and the mock freeCodeCamp data server in two terminals:

   ```console
   pnpm run develop
   pnpm run mock-fcc-data
   ```

1. Open <http://localhost:3001>.

The app runs on port 3001 and the mock data on port 3002. These ports do not conflict with freeCodeCamp's main platform (ports 3000 and 8000).

With the mock data, any user can join a class from its invite link without a freeCodeCamp account. The class page lists the students in the class. Only `student@classroom.local` has mock progress.

### Sign in during development

You do not need an Auth0 account for local development. `.env.sample` sets `FCC_ENABLE_DEV_LOGIN_MODE=true`, so the sign in page shows a "Development sign in" form. Type an email and select the button to sign in as that user.

The seed creates these users:

| Email                     | Role    |
| ------------------------- | ------- |
| `admin@classroom.local`   | Admin   |
| `teacher@classroom.local` | Teacher |
| `student@classroom.local` | Student |

The seed also creates the classroom `seed-classroom` for the teacher. A new email creates a new user with no role.

The app refuses to start in production when `FCC_ENABLE_DEV_LOGIN_MODE` is `true`.

### Reset your local data

Restarting `pnpm run mock-fcc-data` does not change users or classes. They are stored in Postgres.

- To restore the seed users and `seed-classroom`, run `pnpm exec prisma db seed`. Other users and classes stay.
- To start again from an empty database, run `pnpm run db:reset`. It deletes all local data, applies the migrations and seeds the database. Prisma asks you to confirm first.

### Read the email that the app sends

In development, the app sends email to Mailpit. Open <http://localhost:8026> to read it. Mailpit uses ports 1026 and 8026, so it does not conflict with the Mailpit of freeCodeCamp's main platform (ports 1025 and 8025). Use this to test the teacher invitation flow.

### Run the tests

```console
pnpm run lint
pnpm test
```

The end-to-end tests use Playwright. Install the browser once:

```console
pnpm run test:e2e:install
```

The end-to-end tests write to the database. Run them against a separate database, not the one that you use for development:

1. Stop `pnpm run develop`. If a server already runs on port 3001, the tests use that server and its database.
1. Create and seed a test database. `prisma migrate deploy` creates the database if it does not exist:
   ```console
   DATABASE_URL=postgresql://postgres:password@localhost:5432/classroom_e2e pnpm exec prisma migrate deploy
   DATABASE_URL=postgresql://postgres:password@localhost:5432/classroom_e2e pnpm exec prisma db seed
   ```
1. Run the tests:
   ```console
   DATABASE_URL=postgresql://postgres:password@localhost:5432/classroom_e2e pnpm run test:e2e
   ```

### Use a different database

The app connects to the database in `DATABASE_URL`. To use a managed Postgres database, set `DATABASE_URL` to its connection string, then apply the migrations:

```console
pnpm exec prisma migrate deploy
```

Do not run `pnpm run setup` for a managed database, because it starts the local Postgres container.

### Styling a component

We recommend styling components using our [design style guide](https://design-style-guide.freecodecamp.org/).

We are strongly opinionated about adding new variables/tokens to the colors. After careful research, the colors have been chosen to respect the freeCodeCamp brand identity, developer experience, and accessibility.

### System Design and Architecture

![System Diagram](https://github.com/freeCodeCamp/classroom/assets/44416323/8278d34f-af4d-48a0-bc2e-7f30c5ad011a)

We recommend going through our [system design diagram](https://www.canva.com/design/DAFo8ezu7W8/EfUE0hjSDuJHFRGnG9NOvQ/edit?utm_content=DAFo8ezu7W8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton).

### Challenge map (FCC Proper)

**What it is:** The challenge map (`data/challengeMap.json`) is a flat lookup
that maps every freeCodeCamp challenge id to the superblock(s) and block(s) it
belongs to, plus its human-readable name:

```json
{
  "<challengeId>": {
    "superblocks": ["responsive-web-design", "responsive-web-design-22"],
    "blocks": ["basic-html-and-html5"],
    "name": "Say Hello to HTML Elements"
  }
}
```

**Why Classroom needs it:** FCC Proper reports a student's progress as a flat
list of completed challenge ids, with no curriculum structure attached. The
teacher dashboard needs that progress grouped by certification and block. The
helpers in [`util/challengeMapUtils.ts`](util/challengeMapUtils.ts) look each
completed id up in this map and re-nest the flat data into the
`{ certifications: [...] }` shape the dashboard renders. A challenge can belong
to several superblocks/blocks (e.g. current and legacy `-22` versions), so both
are stored as arrays ordered as the GraphQL build encounters them. The dashboard
must group each challenge under exactly one cert/block, so
[`util/challengeMapHelpers.ts`](util/challengeMapHelpers.ts) centralizes a
"first occurrence wins" rule: the first element of each array is used as the
canonical location. This keeps callers and tests from independently re-implementing
the same choice and drifting apart.

It is built from the FCC Proper GraphQL curriculum database by
`scripts/build-challenge-map-graphql.ts`.

To generate or refresh the map:

```console
pnpm run challenge-map
```

To run the challenge map tests (they read the current `data/challengeMap.json`):

```console
pnpm run test:challenge-map
```

### Set up Auth0

Production uses Auth0, like freeCodeCamp's main platform. You need Auth0 only to test the real sign in flow.

1. Go to [auth0.com](https://auth0.com/) and sign in.

1. Create a "Regular Web Application".

1. In the "Settings" tab, copy these values to your `.env` file:

   | Auth0 setting | `.env` variable       | Example                    |
   | ------------- | --------------------- | -------------------------- |
   | Domain        | `AUTH0_DOMAIN`        | `your-tenant.us.auth0.com` |
   | Client ID     | `AUTH0_CLIENT_ID`     | `abc123`                   |
   | Client Secret | `AUTH0_CLIENT_SECRET` | `example-secret`           |

   Write `AUTH0_DOMAIN` without `https://` and without a trailing slash.

1. In the same tab, add these URLs, then save the changes:

   | Auth0 setting         | Value                                           |
   | --------------------- | ----------------------------------------------- |
   | Allowed Callback URLs | `http://localhost:3001/api/auth/callback/auth0` |
   | Allowed Logout URLs   | `http://localhost:3001`                         |

   For GitHub Codespaces, use `https://{CODESPACE_NAME}-3001.app.github.dev` in place of `http://localhost:3001`. Also set `NEXTAUTH_URL` and `CLASSROOM_APP_BASE_URL` in `.env` to this URL. Auth0 accepts more than one URL, separated by commas.

1. Set `FCC_ENABLE_DEV_LOGIN_MODE=false` in `.env`, then restart `pnpm run develop`. The sign in page now sends you to Auth0.

To use one Auth0 application for both Classroom and freeCodeCamp's main platform on your machine, add both callback URLs:

| Auth0 setting         | Value                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Allowed Callback URLs | `http://localhost:3000/auth/auth0/callback, http://localhost:3001/api/auth/callback/auth0` |
| Allowed Logout URLs   | `http://localhost:3000, http://localhost:3001`                                             |

This [video](https://youtu.be/38OwBwQEQz4) shows the setup.

**If the sign in fails:**

- "Callback URL mismatch": the Allowed Callback URLs do not include the exact URL of the app.
- "Invalid state": clear the cookies for `localhost`, then try again.
- Examine the Auth0 logs in the Auth0 dashboard for the error message.

### Configure production

The app refuses to start when `DATABASE_URL`, `NEXTAUTH_URL` or `NEXTAUTH_SECRET` is empty.

In production, the app also refuses to start when one of these conditions is true:

- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID` or `AUTH0_CLIENT_SECRET` is empty.
- `NEXTAUTH_SECRET` has the sample value. Make a secret with `openssl rand -base64 32`.
- `FCC_ENABLE_DEV_LOGIN_MODE` is `true`.

Set the `SMTP_*` variables to your email provider. `.env.sample` lists all the variables.

### Teacher invitations

When `TEACHER_INVITES_ENABLED` is `true`, an admin can invite a teacher from the admin dashboard:

1. The admin creates an invitation, or sends an invitation again.
1. Classroom sends an email with a link in the form `/teacher/invite/<token>`. `CLASSROOM_APP_BASE_URL` sets the start of the link.
1. The teacher signs in with the invited email and accepts the invitation.
1. Classroom gives the teacher the `TEACHER` role.

To test this flow locally, sign in as `admin@classroom.local` and invite an email. Read the invitation in Mailpit. Then open the link in a private browser window and sign in with the invited email.

### Test with a local FCC Proper

By default, Classroom shows mock student data. To test with real completion data, run FCC Proper on your machine and connect Classroom to it.

First, set up FCC Proper with the [freeCodeCamp contributor guide](https://contribute.freecodecamp.org/#/how-to-setup-freecodecamp-locally). FCC Proper needs Auth0. You can use one Auth0 application for both apps, as [Set up Auth0](#set-up-auth0) describes. Classroom keeps its "Development sign in" form, so it does not need Auth0.

#### Set up FCC Proper

1. Check out the `main` branch of [freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp). Use the Node and pnpm versions that its contributor guide asks for.
1. Copy any new variables from `sample.env` to `.env`. Keep your Auth0 variables. Then set:

   ```
   FCC_ENABLE_CLASSROOM=true
   TPA_API_BEARER_TOKEN=local-test-secret-123
   ```

   The workflows below say which value to use for `FCC_ENABLE_DEV_LOGIN_MODE`.

1. In `client/config/growthbook-features-default.json`, set `defaultValue` of the `classroom-mode` feature to `true`.
1. If you set up FCC Proper before, clear its database to remove old data.
1. Run `pnpm install`, `docker start mongodb` and `pnpm run develop`. FCC Proper runs on `http://localhost:3000`.

#### Set up Classroom

1. In the Classroom `.env`, set:

   ```
   FCC_API_URL=http://localhost:3000
   TPA_API_BEARER_TOKEN=local-test-secret-123
   ```

   The token must be the same in both apps.

1. Run `pnpm run db:reset`. It deletes all local data and seeds the database.
1. In one terminal, run `pnpm run develop`. In a second terminal, run `pnpm exec prisma studio`.

#### Test the join flow

This tests the `get-user-id` endpoint. Set `FCC_ENABLE_DEV_LOGIN_MODE=false` in FCC Proper.

1. Sign in to FCC Proper with a student account. In Settings, turn on Classroom Mode.
1. Sign in to Classroom as `teacher@classroom.local` and create a class. The class dashboard shows the join link.
1. Open the join link in a private browser window. Sign in to Classroom with the email of the FCC Proper student account, then select **Connect to Classroom**.

In Prisma Studio, the student's `fccProperUserId` now has a value.

#### Test the dashboard data

This tests the `get-user-data` endpoint, without the join flow. Set `FCC_ENABLE_DEV_LOGIN_MODE=true` in FCC Proper, then run `pnpm run seed:certified-user` in FCC Proper.

1. Sign in to FCC Proper. Dev login signs you in as the seed user `foo@bar.com`. In Settings, turn on Classroom Mode.
1. Sign in to Classroom as `foo@bar.com`, so that Classroom creates the user. Then sign out.
1. In Prisma Studio, set `fccProperUserId` of `foo@bar.com` to the `_id` of `foo@bar.com` in the FCC Proper MongoDB.
1. Sign in to Classroom as `teacher@classroom.local` and create a class.
1. In Prisma Studio, add the `id` of `foo@bar.com` to `fccUserIds` of the class.
1. Open the class dashboard. It shows `foo@bar.com` with their completion data.

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

- [Next.js Pages Router](https://nextjs.org/docs/pages)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma](https://www.prisma.io/docs)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/docs/intro)

---

### License

Copyright © 2021 freeCodeCamp.org

The content of this repository is bound by the following licenses:

- The computer software is licensed under the [BSD-3-Clause](LICENSE.md) license.

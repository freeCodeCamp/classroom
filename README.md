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

Need more help? Ran into issues? Check out this [guide](https://docs.google.com/document/d/1apfjzfIwDAfg6QQf2KD1E1aeD-KU7DEllwnH9Levq4A/edit) that walks you through all the steps of setting up the repository locally, without Docker.

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

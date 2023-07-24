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

### Setup Instructions

<details>
<summary>Codespaces</summary>

1. Create a fork of the repository

2. Open the Codespace by navigatig to your fork > click 'Code' > click the 'Codespaces' tab > click 'Open with Codespaces'

3. After everything loads you should be able to see 3 URLs in your terminal 1. Mock user data URL, 2. Homepage URL and 3. Callback URL

4. Update the MOCK_USER_DATA_URL and the NEXTAUTH_URL(Homepage URL) variables in the .env file with the respective URLs

5. Setup an OAuth app via GitHub (you will add the client id and client secret to the .env file, see the following [documentation to setup an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)) NOTE: use the Homepgae URL and the Callback URL to setup the app

6. Update the .env file with the client id and client secret from the OAauth app

7. Install Postgresql using the following commands

   1. sudo apt update
   2. sudo apt-get install postgresql-client
   3. sudo apt-get install postgresql postgresql-contrib
   4. sudo -u postgres psql postgres

8. Run: npm run develop

9. Run: npm run mock-fcc-data

10. Run: sudo service postgresql start

11. Navigate to 'PORTS' and change 3000 and 3001 to be public

12. Verify you're able to see the UI and login via OAuth (some links may not work because we still have 1 last step after this)

13. Run: npx prisma studio

14. Under User > find your email and change ROLE to TEACHER and click the green button 'Save Changes'

Everything should be running now!

</details>

### Get the code (Local)

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

---

**Tips from CodeDay Labs Mentor @ngillux (Natalia Gill)**

---

freeCodeCamp uses the following terms:

Certification = 'superblock'

Course (s) = 'blocks'

Everything under a course/block is a 'challenge'

---

Not sure if you already had this in your resources but I highly recommend this channel!

https://youtu.be/Y6KDk5iyrYE

---

Try the steps in this [discussion post](https://github.com/freeCodeCamp/classroom/discussions/333) (nvm install 16 and npm ci).

---

1. Always make sure postgres is running 'sudo service postgresql start' to start
2. Make sure PORTS 3001 & 3000 are public
3. npm run develop
4. npm run mock-fcc-data
5. If you go to the classes page and see a blank page, you might need to change your user role in Prima to 'TEACHER'. To do this type npx prisma studio then click 'User' in prisma studio and update 'role a' under your user to be TEACHER and save

---

https://jestjs.io/docs/snapshot-testing

---

https://nextjs.org/docs/pages/building-your-application/optimizing/testing#jest-and-react-testing-library

---

[This tutorial/resource](https://blog.logrocket.com/testing-next-js-apps-jest/) on testing a Next.js app with Jest is incredibly helpful, I recommend going through it to get comfortable using Jest with Next.js.

---

Following up with the above^ if you prefer video tutorials [check this out](https://www.youtube.com/watch?v=jQT0Xhgbql8). I recommend listening to his tidbit the first few seconds but the tutorial starts at 1:06. Important information specifically at the 5 minute mark. There is a [blog post](https://fek.io/blog/add-jest-testing-framework-to-an-existing-next-js-app/) to complement this video tutorial.
Keep in mind we use node package manager 'npm' and not yarn. Please let me know if any questions come up if you view this resource.

---

This is just a tip for all mentees working on any classroom issues; I think it’s important to try your best to understand core Next.js concepts, and take the time as you need. No need to rush. That’s the core of this project.

I wanted to share some starter blogs which can help you think of further concepts to explore in the documentation. So any concept you’re not too sure of you can type a search like :

Next.js data fetching

Next.js getServerSideProps

(Those above 2 topics I highly recommend reviewing)

Please check out these articles

https://dillionmegida.com/p/nextjs-main-concepts/

https://blog.devgenius.io/advanced-next-js-concepts-8439a8752597

Also the following terminology:

SSR - Server Side Rendering

SSG - Static Site Generation

ISR - Incremental Static Regeneration

CSR - Client Side Rendering

SSR is probably the focus point.

https://dev.to/mbaljeetsingh/what-is-csr-ssr-ssg-isr-different-rendering-strategies-and-which-framework-does-it-better-angular-react-vue-4lkp

Also to follow up on the above, I don’t mean learn everything there is to know about Next.js, just the main concepts (and you can go in depth as needed).
So depending on what your task is asking of you, you may want to focus on a specific Next.js concept that is present in your task (or knowledge of some concept that may be needed to complete the task).

---

---

### License

Copyright © 2021 freeCodeCamp.org

The content of this repository is bound by the following licenses:

- The computer software is licensed under the [BSD-3-Clause](LICENSE.md) license.

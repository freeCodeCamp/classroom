[![freeCodeCamp Social Banner](https://s3.amazonaws.com/freecodecamp/wide-social-banner.png)](https://www.freecodecamp.org/)

[![Pull Requests Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![first-timers-only Friendly](https://img.shields.io/badge/first--timers--only-friendly-blue.svg)](http://www.firsttimersonly.com/)

[freeCodeCamp.org](https://www.freecodecamp.org) is a friendly community where you can learn to code for free. It is run by a [donor-supported 501(c)(3) nonprofit](https://www.freecodecamp.org/donate) to help millions of busy adults transition into tech. Our community has already helped more than 40,000 people get their first developer job. Our full-stack web development and machine learning curriculum is completely free and self-paced. We have thousands of interactive coding challenges to help you expand your skills.

# Classroom

A self-hosted solution to help teachers plan and manage classroom-based learning, on top of freeCodeCamp's learning platform.

## Motivation

For a while now teachers have been asking for a way to get a birds eye view of multiple students who are progressing through the course. This is why we set out to make freeCodeCamp classroom mode, an interactive dashboard for teachers to view multiple freeCodeCamp users’ progress on their courses.

## Contributing

This project supports multiple ways to set up the codebase. You can choose to either to use Gitpod or Github Codespaces for a browser environment or set up locally. Please use whichever you feel the most comfortable with. We recommend Github Codespaces if you are not sure.

Please read our contibution [guidelines](https://contribute.freecodecamp.org/#/how-to-contribute-to-the-codebase?id=contributing-to-the-codebase) before making your first pull request.

### Instructions to set up your code:

#### Option 1 - [GitHub Codespaces Environment](docs/GITHUB-CODESPACES-SET-UP.md)

#### Option 2 - [GitPod Dev Environment](docs/GITPOD-SET-UP.md)

#### Option 3 - [Local Docker Enviornment](docs/LOCAL-DOCKER-SET-UP.md)

Need more help? Ran into issues? Check out this [guide](https://docs.google.com/document/d/1apfjzfIwDAfg6QQf2KD1E1aeD-KU7DEllwnH9Levq4A/edit) that walks you through all the steps of setting up the repository locally, without Docker.

### Styling a component

We recommend styling components using our [design style guide](https://design-style-guide.freecodecamp.org/).

We are strongly opinionated about adding new variables/tokens to the colors. After careful research, the colors have been chosen to respect the freeCodeCamp brand identity, developer experience, and accessibility.

### System Design and Architecture

![System Diagram](https://github.com/freeCodeCamp/classroom/assets/44416323/8278d34f-af4d-48a0-bc2e-7f30c5ad011a)

We recommend going through our [system design diagram](https://www.canva.com/design/DAFo8ezu7W8/EfUE0hjSDuJHFRGnG9NOvQ/edit?utm_content=DAFo8ezu7W8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton).

## Resources

### Contact Information

Join us in our [Discord Chat](https://discord.gg/qcynkd4Edx).

### Terminology

freeCodeCamp uses the following terms:

`Certification = 'superblock'`

`Course(s) = 'blocks'`

Everything under a course/block is a `'challenge'`

### API

This project uses multiple APIs from freeCodeCamp. Check out the following and familiarize yourself.

[Superblock API](https://www.freecodecamp.org/curriculum-data/v1/available-superblocks.json)

[Blocks API](https://www.freecodecamp.org/curriculum-data/v1/2022/responsive-web-design.json)

Mock API: Student information - this will be replaced with real student information in the future. It is **not available publicly** yet, you will need to start the application and go to http://localhost:3001/data.

### Tech Stack Learning Resources

#### Jest Snapshot Testing

> We are always in need of more tests! Checkout Jest's [snapshot testing docs](https://jestjs.io/docs/snapshot-testing). We recommend learning snapshot testing as we require tests for each component inside our project.

#### Next.js Fullstack Framework

> This project utilizes Next.js to optimize performance, such as SEO. We recommend learning [main concepts of Next.js](https://dillionmegida.com/p/nextjs-main-concepts/) and familiarizing yourself on [testing with Next.js](https://nextjs.org/docs/pages/building-your-application/optimizing/testing#jest-and-react-testing-library).

#### Next.js Terminology:

| Term | Value                           |
| ---- | ------------------------------- |
| SSR  | Server Side Rendering           |
| SSG  | Static Site Generation          |
| ISR  | Incremental Static Regeneration |
| CSR  | Client Side Rendering           |

> ISR is probably the focus point. Checkout this [article](https://dev.to/mbaljeetsingh/what-is-csr-ssr-ssg-isr-different-rendering-strategies-and-which-framework-does-it-better-angular-react-vue-4lkp) to understand these concepts and how they are helpful.

## License

Copyright © 2021 freeCodeCamp.org

The content of this repository is bound by the following licenses:

- The computer software is licensed under the [BSD-3-Clause](LICENSE.md) license.

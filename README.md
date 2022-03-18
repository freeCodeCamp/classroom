## Motivation

FreeCodeCamp is a self guided learning platform for students to learn computer science skills for free. The topics they teach range from web design to machine learning. For a while now teachers have been asking for a way to get a birds eye view of multiple students who are progressing through the course. This is why we set out to make FreeCodeCamp classroom mode, an interactive dashboard for teachers to view multiple FreeCodeCamp users’ progress on their courses.

## Getting Started
  

1. Git Clone the project repo `git clone https://github.com/freeCodeCamp/classroom.git`

2. `cd classroom` & `npm install`

3. Create .env file inside classroom directory based on the `.env.sample`

4. `npx prisma db push`

5. Run `npx prisma generate`

6.  `npm run dev`
/* The line `import prisma from '../../prisma/prisma';` is importing the Prisma client from the `prisma` directory. Prisma
is an Object-Relational Mapping (ORM) tool that allows you to interact with your database using JavaScript. By importing
the Prisma client, you can use its methods to perform database operations such as querying, creating, updating, and
deleting data. */
import prisma from '../../prisma/prisma';
/* The line `import { unstable_getServerSession } from 'next-auth';` is importing the `unstable_getServerSession` function
from the `next-auth` library. This function is used to retrieve the session object for the current user on the
server-side. It is recommended to use this function when working with Next.js and NextAuth.js for server-side
authentication. */
import { unstable_getServerSession } from 'next-auth';
/* The line `import { authOptions } from './auth/[...nextauth]';` is importing the `authOptions` object from the
`auth/[...nextauth]` file. This file likely contains the configuration options for authentication using NextAuth.js. By
importing the `authOptions` object, the code can access and use these configuration options for authentication purposes. */
import { authOptions } from './auth/[...nextauth]';

/**
 * This function handles a DELETE request to delete a classroom, checking if the user is authorized and if the classroom
 * exists before deleting it.
 * @param req - The `req` parameter is the HTTP request object, which contains information about the incoming request such
 * as headers, query parameters, and request body.
 * @param res - The `res` parameter is the response object that is used to send the HTTP response back to the client. It is
 * an instance of the `http.ServerResponse` class in Node.js.
 * @returns a response with a status code of 200 (OK) and ending the response.
 */
export default async function handle(req, res) {
  //unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  /* The line `const session = await unstable_getServerSession(req, res, authOptions);` is calling the
  `unstable_getServerSession` function to retrieve the session object for the current user on the server-side. */
  const session = await unstable_getServerSession(req, res, authOptions);
  let user, classroom;

  /* The line `if (!req.method == 'DELETE') {` is checking if the HTTP request method is not equal to 'DELETE'. */
  if (!req.method == 'DELETE') {
    return res.status(405).end();
  }

  /* The line `if (!session) {` is checking if the `session` object is falsy, meaning it does not exist or is null. If the
  `session` object does not exist, it means that the user is not authenticated or does not have a valid session. In this
  case, the code returns a response with a status code of 403 (Forbidden) and ends the response, indicating that the
  user is not authorized to perform the requested action. */
  if (!session) {
    return res.status(403).end();
  }

  /* The `try` block is used to enclose a section of code that may potentially throw an error. In this case, the `try`
  block is used to wrap the code that attempts to find a unique user in the database based on their email. If an error
  occurs during the execution of the code within the `try` block, the execution will be immediately transferred to the
  corresponding `catch` block. */
  try {
    user = await prisma.user.findUniqueOrThrow({
      where: {
        email: session.user.email
      },
      select: {
        role: true,
        id: true
      }
    });
  } catch {
    /* The line `return res.status(403).end();` is returning a response with a status code of 403 (Forbidden) and ending
    the response. This indicates that the user is not authorized to perform the requested action. */
    return res.status(403).end();
  }

  //checks whether user is teacher/admin
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return res.status(403).end();
  }

  /* The line `const data = req.body;` is assigning the value of the `req.body` property to the variable `data`. */
  const data = req.body;

  /* The `try` block is used to enclose a section of code that may potentially throw an error. In this case, the `try`
  block is used to wrap the code that attempts to find a unique user in the database based on their email. If an error
  occurs during the execution of the code within the `try` block, the execution will be immediately transferred to the
  corresponding `catch` block. */
  try {
    classroom = await prisma.classroom.findUniqueOrThrow({
      where: {
        classroomId: data
      }
    });
  } catch {
    /* The line `return res.status(400).end();` is returning a response with a status code of 400 (Bad Request) and ending
    the response. This indicates that there was a problem with the request made by the client. In this case, it is
    likely that the requested classroom does not exist in the database. */
    return res.status(400).end();
  }

  //makes sure teacher can only delete their own class
  if (user.role === 'TEACHER' && user.id !== classroom.classroomTeacherId) {
    /* The line `return res.status(403).end();` is returning a response with a status code of 403 (Forbidden) and ending
    the response. This indicates that the user is not authorized to perform the requested action. */
    return res.status(403).end();
  }

  await prisma.classroom.delete({
    where: {
      classroomId: data
    }
  });

  /* The line `return res.status(200).end();` is returning a response with a status code of 200 (OK) and ending the
  response. This indicates that the requested action was successful and there is no additional data to be sent in the
  response body. */
  return res.status(200).end();
}

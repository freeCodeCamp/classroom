/**
 * This JavaScript function handles a POST request to create a classroom in a database, with authentication and
 * authorization checks.
 * @param req - The `req` parameter is an object that represents the HTTP request made to the server. It contains
 * information about the request such as the request method, headers, URL, and body.
 * @param res - The `res` parameter is the response object that is used to send a response back to the client. It has
 * methods such as `status()` to set the HTTP status code of the response, `end()` to end the response without any data,
 * and `json()` to send a JSON response.
 * @returns The code is returning a JSON response containing the newly created class object from the database.
 */
/* The line `import prisma from '../../prisma/prisma';` is importing the Prisma client from the `prisma` directory. Prisma
is an Object-Relational Mapping (ORM) tool that allows you to interact with your database using JavaScript. By importing
the Prisma client, you can use its methods to perform database operations such as querying, creating, updating, and
deleting data. */
import prisma from '../../prisma/prisma';
/* The line `import { unstable_getServerSession } from 'next-auth';` is importing the `unstable_getServerSession` function
from the `next-auth` library. */
import { unstable_getServerSession } from 'next-auth';
/* The line `import { authOptions } from './auth/[...nextauth]';` is importing the `authOptions` object from the
`auth/[...nextauth]` file. This file likely contains the configuration options for the authentication system being used
in the application. By importing the `authOptions` object, the code can pass it as an argument to the
`unstable_getServerSession` function to handle authentication and authorization checks. */
import { authOptions } from './auth/[...nextauth]';

/**
 * This JavaScript function handles a POST request to create a classroom, checking the user's role and permissions before
 * creating the classroom in the database.
 * @param req - The `req` parameter is the HTTP request object, which contains information about the incoming request such
 * as headers, query parameters, and request body.
 * @param res - The `res` parameter is the response object that is used to send the HTTP response back to the client. It is
 * an instance of the `http.ServerResponse` class in Node.js.
 * @returns a JSON response containing the created class data if all the conditions are met. If any of the conditions fail,
 * it will return an appropriate HTTP status code (405, 403) and end the response.
 */
export default async function handle(req, res) {
  //unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  /* The line `const session = await unstable_getServerSession(req, res, authOptions);` is calling the
  `unstable_getServerSession` function from the `next-auth` library. This function is used to retrieve the user session
  from the server-side. */
  const session = await unstable_getServerSession(req, res, authOptions);
  let user;

  if (!req.method == 'POST') {
    /* The line `return res.status(405).end();` is setting the HTTP status code of the response to 405 (Method Not Allowed)
    and ending the response without sending any data. This is used to indicate that the requested HTTP method (in this
    case, POST) is not allowed for the current endpoint. */
    return res.status(405).end();
  }

  if (!session) {
    /* The line `return res.status(403).end();` is setting the HTTP status code of the response to 403 (Forbidden) and
    ending the response without sending any data. This is used to indicate that the user is not authorized to perform
    the requested action. */
    return res.status(403).end();
  }

  /* The `try` block is used to enclose a section of code that may potentially throw an error. In this case, the `try`
  block is used to wrap the code that queries the database to find the user based on their email. If an error occurs
  during the execution of this code, the `catch` block will be executed to handle the error. */
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
    /* The line `return res.status(403).end();` is setting the HTTP status code of the response to 403 (Forbidden) and
    ending the response without sending any data. This is used to indicate that the user is not authorized to perform
    the requested action. */
    return res.status(403).end();
  }

  //checks whether user is teacher/admin
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return res.status(403).end();
  }

  /* The line `const data = req.body;` is assigning the value of the `req.body` property to the `data` variable. */
  const data = req.body;

  //makes sure teacher is only creating class for themselves
  /* The line `if (user.role === 'TEACHER' && user.id !== data['classroomTeacherId'])` is checking if the user's role is
  'TEACHER' and if the user's ID is not equal to the value of `data['classroomTeacherId']`. */
  if (user.role === 'TEACHER' && user.id !== data['classroomTeacherId']) {
    return res.status(403).end();
  }

  /* The code is using the Prisma client to create a new classroom in the database. It is calling the `create` method on
  the `classroom` model and passing an object with the data for the new classroom. The data includes the classroom name,
  description, teacher ID, and FCC certifications. The `await` keyword is used to wait for the database operation to
  complete before continuing execution. The result of the `create` method is assigned to the `createClassInDB` variable. */
  const createClassInDB = await prisma.classroom.create({
    data: {
      classroomName: data['className'],
      description: data['description'],
      classroomTeacherId: data['classroomTeacherId'],
      fccCertifications: data['fccCertifications']
    }
  });

  /* The line `return res.json(createClassInDB);` is sending a JSON response back to the client with the newly created
  class object from the database. The `res.json()` method serializes the JavaScript object `createClassInDB` into a JSON
  string and sends it as the response body. */
  return res.json(createClassInDB);
}

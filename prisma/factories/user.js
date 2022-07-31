const { PrismaClient } = require('@prisma/client');

// TODO: replace this with the global prisma client
const prisma = new PrismaClient();

exports.createUsers = function createUsers() {
  const usersData = [
    {
      name: 'foo',
      email: 'foo@bar.com',
      emailVerified: new Date(),
      role: 'STUDENT'
    },
    {
      name: 'boo',
      email: 'boo@far.com',
      emailVerified: new Date(),
      role: 'TEACHER'
    }
  ];
  const usersPromise = usersData.map(
    async data => await prisma.user.create({ data })
  );
  return Promise.all(usersPromise);
};

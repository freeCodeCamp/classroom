import prisma from '../../../prisma/prisma';

export default async function handle(req, res) {
  let body = req.body;

  const updateTeacher = await prisma.user.update({
    where: {
      id: body.id
    },
    data: {
      name: body.name,
      email: body.email,
      isAdminApproved: body.isAdminApproved
    }
  });
  res.redirect(307, '/admin');
  res.json(updateTeacher);
}

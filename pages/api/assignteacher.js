import prisma from '../../prisma/prisma';
export default async function handle(req, res) {
  if (req.method == 'POST') {
    const body = JSON.parse(req.body);
    //if name and email are not in body, they will be undefined and prisma will not change those fields
    await prisma.user.update({
      where: {
        id: body.id
      },
      data: {
        name: body.name,
        email: body.email,
        role: 'TEACHER'
      }
    });

    res.status(200).end();
  } else {
    res.status(405).end();
  }
}

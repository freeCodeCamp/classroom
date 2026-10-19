import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/prisma';
import { requireAuthenticatedUser, requireMethod } from '../../util/apiAuth';
import { Role } from '../../util/roles';

const ROLES: readonly string[] = Object.values(Role);

// The form sends '' for a field the admin left empty. A missing, non-string
// or empty value means "don't change this field".
const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const isUniqueConstraintError = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  (err as { code?: unknown }).code === 'P2002';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<unknown> {
  if (!requireMethod(req, res, 'POST')) return;
  const user = await requireAuthenticatedUser(req, res, {
    allowedRoles: [Role.ADMIN]
  });
  if (!user) return;

  const body = (req.body ?? {}) as Record<string, unknown>;
  const id = optionalString(body.id);
  const name = optionalString(body.name);
  const email = optionalString(body.email);
  const role = optionalString(body.role);

  if (!id) {
    return res.status(400).json({ error: 'User id is required' });
  }
  if (role !== undefined && !ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const userToBeChanged = await prisma.user.findUnique({
    where: { id },
    select: { role: true }
  });
  if (!userToBeChanged) {
    return res.status(404).json({ error: 'User not found' });
  }

  //If user attempts to change a role from Admin to non-Admin, then the change will be denied.
  if (userToBeChanged.role === Role.ADMIN && role !== Role.ADMIN) {
    return res.status(403).end();
  }

  try {
    //if any parameter is undefined then prisma will not change it
    await prisma.user.update({
      where: { id },
      data: { name, email, role }
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    throw err;
  }

  return res.status(200).end();
}

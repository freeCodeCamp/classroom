import type { JoinMode as PrismaJoinMode } from '../generated/prisma/enums';

/**
 * Who can join a class through its invite link. Kept here as plain strings
 * (like util/roles.ts) so browser code can use it without the Prisma client.
 * Students already in the class are not affected by the mode.
 */
export const JoinMode = {
  OPEN: 'OPEN',
  ASK_TO_JOIN: 'ASK_TO_JOIN',
  CLOSED: 'CLOSED'
} as const satisfies Record<PrismaJoinMode, PrismaJoinMode>;

export type JoinMode = (typeof JoinMode)[keyof typeof JoinMode];

export const JOIN_MODE_OPTIONS: {
  value: JoinMode;
  label: string;
  description: string;
}[] = [
  {
    value: JoinMode.OPEN,
    label: 'Open',
    description: 'Anyone with the invite link can join right away.'
  },
  {
    value: JoinMode.ASK_TO_JOIN,
    label: 'Ask to join',
    description:
      'Students with the invite link send a request, and you approve or decline it.'
  },
  {
    value: JoinMode.CLOSED,
    label: 'Closed',
    description:
      'No one new can join. Students already in the class are not affected.'
  }
];

export const isJoinMode = (value: unknown): value is JoinMode =>
  typeof value === 'string' &&
  (Object.values(JoinMode) as string[]).includes(value);

export const Role = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  NONE: 'NONE'
} as const;

export type Role = (typeof Role)[keyof typeof Role];

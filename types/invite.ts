import type { IncomingHttpHeaders } from 'http';
import type { NextApiRequest } from 'next';

export type HeadersRequest = {
  headers?: IncomingHttpHeaders;
};

export type PaginationRequest = Pick<NextApiRequest, 'query'>;

export type RequireAuthenticatedUserOptions = {
  allowedRoles?: string[] | null;
  roleError?: string;
};

export type TeacherInvitationEmailParams = {
  invitedTeacherEmail: string;
  inviteUrl?: string;
  expiresAt?: Date | string | number;
  invitedByEmail?: string | null;
};

export type TeacherInvitationEmailResult = {
  success: true;
  messageId: string;
};

export type TeacherInvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'CANCELLED';

export type TeacherInvitationListItem = {
  teacherInvitationId: string;
  invitedTeacherEmail: string;
  status: TeacherInvitationStatus;
  expiresAt: string;
};

export type TeacherInvitationListResponse = {
  invitations?: TeacherInvitationListItem[];
};

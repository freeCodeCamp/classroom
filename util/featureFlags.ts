/**
 * Feature flag helpers for gradual rollout of features
 */

export function isTeacherInvitesEnabled(): boolean {
  // Default to enabled if env var not set
  const envValue = process.env.TEACHER_INVITES_ENABLED;
  if (envValue === undefined) {
    return true;
  }
  return envValue === 'true';
}

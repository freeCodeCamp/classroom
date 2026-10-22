export const CLASS_NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

export function getClassroomValidationError(
  body: unknown,
  partial = false
): string | null {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be an object';
  }

  const { classroomName, description } = body as Record<string, unknown>;
  if (
    (!partial || classroomName !== undefined) &&
    (typeof classroomName !== 'string' ||
      classroomName.length === 0 ||
      classroomName.length > CLASS_NAME_MAX_LENGTH)
  ) {
    return `Class name must be between 1 and ${CLASS_NAME_MAX_LENGTH} characters`;
  }

  // The database allows a missing or null description. Validate supplied text
  // without changing that contract or the API's partial-update semantics.
  if (
    description !== undefined &&
    description !== null &&
    (typeof description !== 'string' ||
      description.length > DESCRIPTION_MAX_LENGTH)
  ) {
    return `Description must be a string of at most ${DESCRIPTION_MAX_LENGTH} characters`;
  }

  return null;
}

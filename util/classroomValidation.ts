export const CLASS_NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

export type ClassroomTextFields = {
  classroomName?: string;
  description?: string | null;
};

/** True for a plain JSON object: not null, an array or a primitive. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export type NewClassroomTextFields = ClassroomTextFields & {
  classroomName: string;
};

export type ClassroomTextResult<Fields = ClassroomTextFields> =
  | { error: string; fields?: undefined }
  | { error?: undefined; fields: Fields };

/**
 * Trims the classroom name and description, then validates the trimmed text.
 *
 * Leading and trailing whitespace is never saved, so the limits apply to the
 * trimmed text: a name made only of spaces is empty and rejected, and padding
 * past the limit is accepted once it is trimmed away. Whitespace inside the
 * text is kept.
 *
 * With `partial`, an omitted name is allowed and stays omitted (for edits).
 * The description stays optional: omitted and null pass through unchanged,
 * because the database allows a missing or null description.
 */
export function parseClassroomTextFields(
  body: unknown
): ClassroomTextResult<NewClassroomTextFields>;
export function parseClassroomTextFields(
  body: unknown,
  partial: true
): ClassroomTextResult;
export function parseClassroomTextFields(
  body: unknown,
  partial = false
): ClassroomTextResult {
  if (!isRecord(body)) {
    return { error: 'Request body must be an object' };
  }

  const { classroomName, description } = body;
  const fields: ClassroomTextFields = {};

  if (!partial || classroomName !== undefined) {
    const name =
      typeof classroomName === 'string' ? classroomName.trim() : null;
    if (
      name === null ||
      name.length === 0 ||
      name.length > CLASS_NAME_MAX_LENGTH
    ) {
      return {
        error: `Class name must be between 1 and ${CLASS_NAME_MAX_LENGTH} characters`
      };
    }
    fields.classroomName = name;
  }

  if (description === undefined || description === null) {
    fields.description = description;
  } else {
    const text = typeof description === 'string' ? description.trim() : null;
    if (text === null || text.length > DESCRIPTION_MAX_LENGTH) {
      return {
        error: `Description must be a string of at most ${DESCRIPTION_MAX_LENGTH} characters`
      };
    }
    fields.description = text;
  }

  return { fields };
}

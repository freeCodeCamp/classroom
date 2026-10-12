import { fetchUserData } from '../fcc-api';
import type { User } from '../../generated/prisma/client';
import type {
  FetchStudentDataResult,
  FccUserDataByUserId,
  StudentDashboardData,
  StudentDashboardDataList
} from '../../types/student';

type StudentFccLink = Pick<User, 'email' | 'fccProperUserId'>;

/**
 * Fetches student completion data from the fCC API and transforms it into the
 * nested dashboard format expected by the classroom UI components.
 *
 * @param {Array<{id: string, email: string, fccProperUserId: string|null}>} students
 *   Classroom User records with at least id, email, and fccProperUserId.
 * @returns {Promise<Array<{email: string, certifications: Array}>>}
 *   Dashboard-ready student data, one entry per student that has a linked fCC account.
 */
export async function fetchClassroomStudentData(
  students: StudentFccLink[]
): Promise<StudentDashboardData[]> {
  const studentsWithFccId = students.filter(
    (s): s is StudentFccLink & { fccProperUserId: string } =>
      Boolean(s.fccProperUserId)
  );

  if (studentsWithFccId.length === 0) return [];

  const fccUserIds = studentsWithFccId.map(s => s.fccProperUserId);
  const { data } = await fetchUserData(fccUserIds);

  // Map fccProperUserId → email so resolveAllStudentsToDashboardFormat
  // can key the output by email (which the dashboard components expect).
  const idToEmail: Record<string, string | null> = {};
  for (const student of studentsWithFccId) {
    idToEmail[student.fccProperUserId] = student.email;
  }

  const emailKeyedData: FccUserDataByUserId = {};
  for (const [fccId, challenges] of Object.entries(data)) {
    const email = idToEmail[fccId];
    if (email) {
      emailKeyedData[email] = challenges;
    }
  }

  // Dynamic import keeps challengeMapUtils (which uses Node's `fs`) out of
  // the client bundle — it is only ever called server-side inside
  // getServerSideProps.
  const { resolveAllStudentsToDashboardFormat } =
    await import('../challengeMapUtils');
  return resolveAllStudentsToDashboardFormat(emailKeyedData);
}

/**
 * Fetches student data from the mock data URL (development only).
 * @returns {Promise<{error: string|null, data: Array|null, status?: number}>}
 * @deprecated Use fetchClassroomStudentData with fCC API in production.
 */
export async function fetchStudentData(): Promise<FetchStudentDataResult> {
  if (!process.env.MOCK_USER_DATA_URL) {
    console.warn('MOCK_USER_DATA_URL is not defined.');
    return { error: 'MISSING_URL', data: null };
  }
  try {
    const response = await fetch(process.env.MOCK_USER_DATA_URL);
    if (!response.ok) {
      return { error: 'FETCH_FAILED', status: response.status, data: null };
    }
    return {
      error: null,
      data: (await response.json()) as StudentDashboardDataList
    };
  } catch {
    return { error: 'NETWORK_ERROR', data: null };
  }
}

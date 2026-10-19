import { getServerSideProps } from '../../pages/dashboard/v2/[id]';
import type ClassroomDashboard from '../../pages/dashboard/v2/[id]';
import type { ComponentProps } from 'react';
import type { GetServerSidePropsContext } from 'next';
import type { Session } from 'next-auth';
import { getSessionUser } from '../../util/pageAuth';
import prisma from '../../prisma/prisma';
import { getSuperBlockJsons } from '../../util/legacy/getSuperBlockJsons';
import {
  fetchClassroomStudentData,
  fetchStudentData
} from '../../util/student/fetchStudentData';

vi.mock('../../util/pageAuth', () => ({ getSessionUser: vi.fn() }));
vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    user: { findMany: vi.fn() },
    classroom: { findUnique: vi.fn() }
  }
}));
vi.mock(
  '../../util/curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray',
  () => ({
    getAllTitlesAndDashedNamesSuperblockJSONArray: vi.fn(async () => [])
  })
);
vi.mock('../../util/legacy/getDashedNamesURLs', () => ({
  getDashedNamesURLs: vi.fn(async names => names)
}));
vi.mock('../../util/legacy/getSuperBlockJsons', () => ({
  getSuperBlockJsons: vi.fn(async () => [])
}));
vi.mock('../../util/dashboard/createSuperblockDashboardObject', () => ({
  createSuperblockDashboardObject: vi.fn(async () => [])
}));
vi.mock('../../util/student/fetchStudentData', () => ({
  fetchStudentData: vi.fn(),
  fetchClassroomStudentData: vi.fn()
}));

type DashboardResult = { props: ComponentProps<typeof ClassroomDashboard> };

const context = {
  params: { id: 'class-1' },
  req: { headers: { host: 'localhost:3001' } }
} as unknown as GetServerSidePropsContext;

const mockStudents = [
  { email: 'student[A]@gmail.com', certifications: [] },
  { email: 'student[B]@gmail.com', certifications: [] }
];

describe('class page getServerSideProps', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.FCC_API_URL;
    delete process.env.CLASSROOM_APP_BASE_URL;
    delete process.env.NEXTAUTH_URL;
    vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(getSessionUser).mockResolvedValue({
      session: { user: { email: 'teacher@example.org' } } as unknown as Session,
      user: { id: 'teacher-1', email: 'teacher@example.org', role: 'TEACHER' }
    });
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue({
      classroomTeacherId: 'teacher-1',
      classroomName: 'Period 3',
      description: '',
      createdAt: new Date('2026-09-02'),
      fccCertifications: ['responsive-web-design'],
      fccUserIds: []
    } as unknown as Awaited<ReturnType<typeof prisma.classroom.findUnique>>);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('redirects to /error when there is no session user', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: { destination: '/error', permanent: false }
    });
  });

  it('redirects a non-owner to /classes', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      session: { user: { email: 'other@example.org' } } as unknown as Session,
      user: { id: 'teacher-2', email: 'other@example.org', role: 'TEACHER' }
    });

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: { destination: '/classes', permanent: false }
    });
  });

  it('redirects to /classes when the classroom does not exist', async () => {
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue(null);

    const result = await getServerSideProps(context);

    expect(result).toEqual({
      redirect: { destination: '/classes', permanent: false }
    });
  });

  // Regression test: mock mode used to hide the mock students behind
  // "No students yet" whenever nobody had joined the class.
  it('shows every mock student in mock mode, even with no one enrolled', async () => {
    vi.mocked(fetchStudentData).mockResolvedValue({
      error: null,
      data: mockStudents
    });

    const { props } = (await getServerSideProps(
      context
    )) as unknown as DashboardResult;

    expect(props.isEmpty).toBe(false);
    expect(props.studentCount).toBe(2);
    expect(props.studentData).toHaveLength(2);
  });

  it('counts enrolled students when using the fCC API', async () => {
    process.env.FCC_API_URL = 'http://localhost:3000';
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);
    vi.mocked(fetchClassroomStudentData).mockResolvedValue([]);

    const { props } = (await getServerSideProps(
      context
    )) as unknown as DashboardResult;

    expect(props.isEmpty).toBe(true);
    expect(props.studentCount).toBe(0);
    expect(fetchStudentData).not.toHaveBeenCalled();
  });

  it('reports a fetch error instead of crashing when the curriculum fails', async () => {
    vi.mocked(fetchStudentData).mockResolvedValue({
      error: null,
      data: mockStudents
    });
    vi.mocked(getSuperBlockJsons).mockRejectedValueOnce(
      new Error('GraphQL down')
    );

    const { props } = (await getServerSideProps(
      context
    )) as unknown as DashboardResult;

    expect(props.fetchError).toBe('FETCH_FAILED');
    expect(props.isEmpty).toBe(false);
  });

  it('reports a fetch error when the fCC API fails', async () => {
    process.env.FCC_API_URL = 'http://localhost:3000';
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);
    vi.mocked(fetchClassroomStudentData).mockRejectedValue(new Error('503'));

    const { props } = (await getServerSideProps(
      context
    )) as unknown as DashboardResult;

    expect(props.fetchError).toBe('FETCH_FAILED');
  });

  it('builds the invite link from the configured app URL', async () => {
    process.env.CLASSROOM_APP_BASE_URL = 'https://classroom.freecodecamp.org';
    vi.mocked(fetchStudentData).mockResolvedValue({ error: null, data: [] });

    const { props } = (await getServerSideProps(
      context
    )) as unknown as DashboardResult;

    expect(props.joinLink).toBe(
      'https://classroom.freecodecamp.org/join/class-1'
    );
  });
});

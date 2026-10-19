import { getServerSideProps } from '../../pages/dashboard/v2/details/[id]/[studentEmail]';
import type { GetServerSidePropsContext } from 'next';
import type { Session } from 'next-auth';
import prisma from '../../prisma/prisma';
import { getSessionUser } from '../../util/pageAuth';
import { getIndividualStudentData } from '../../util/student/getIndividualStudentData';
import { fetchClassroomStudentData } from '../../util/student/fetchStudentData';

vi.mock('../../util/pageAuth', () => ({ getSessionUser: vi.fn() }));
vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: vi.fn() },
    classroom: { findUnique: vi.fn() }
  }
}));
vi.mock('../../util/curriculum/getSuperblockTitlesInClassroomByIndex', () => ({
  getSuperblockTitlesInClassroomByIndex: vi.fn(async () => [])
}));
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
  fetchClassroomStudentData: vi.fn()
}));
vi.mock('../../util/student/getIndividualStudentData', () => ({
  getIndividualStudentData: vi.fn()
}));

type ClassroomLookup = Awaited<ReturnType<typeof prisma.classroom.findUnique>>;

const context = {
  params: { id: 'class-1', studentEmail: 'student@example.org' }
} as unknown as GetServerSidePropsContext;

const teacher = (id: string) => ({
  session: { user: { email: `${id}@example.org` } } as unknown as Session,
  user: { id, email: `${id}@example.org`, role: 'TEACHER' as const }
});

describe('student details page getServerSideProps', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.FCC_API_URL;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getSessionUser).mockResolvedValue(teacher('teacher-1'));
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue({
      classroomTeacherId: 'teacher-1',
      classroomName: 'Period 3',
      fccCertifications: ['responsive-web-design'],
      fccUserIds: ['user-1']
    } as unknown as ClassroomLookup);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('redirects to /error when there is no session user', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    expect(await getServerSideProps(context)).toEqual({
      redirect: { destination: '/error', permanent: false }
    });
  });

  it('redirects a non-owner to /classes', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(teacher('teacher-2'));

    expect(await getServerSideProps(context)).toEqual({
      redirect: { destination: '/classes', permanent: false }
    });
  });

  it('redirects to /classes when the classroom does not exist', async () => {
    vi.mocked(prisma.classroom.findUnique).mockResolvedValue(null);

    expect(await getServerSideProps(context)).toEqual({
      redirect: { destination: '/classes', permanent: false }
    });
  });

  describe('in mock mode', () => {
    beforeEach(() => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'student@example.org',
        fccProperUserId: null
      } as Awaited<ReturnType<typeof prisma.user.findUnique>>);
    });

    it('keeps the empty student placeholder when mock data has no matching student', async () => {
      vi.mocked(getIndividualStudentData).mockResolvedValue(null);

      const result = (await getServerSideProps(context)) as unknown as {
        props: { studentData: unknown };
      };

      expect(result.props.studentData).toEqual({
        email: 'student@example.org',
        certifications: []
      });
    });

    it('returns 404 for a student who is not in the class', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-2',
        email: 'student@example.org',
        fccProperUserId: null
      } as Awaited<ReturnType<typeof prisma.user.findUnique>>);

      expect(await getServerSideProps(context)).toEqual({ notFound: true });
      expect(getIndividualStudentData).not.toHaveBeenCalled();
    });
  });

  describe('with the fCC API', () => {
    beforeEach(() => {
      process.env.FCC_API_URL = 'https://api.example.org';
    });

    it('returns 404 for a student who is not in the class', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-2',
        email: 'student@example.org',
        fccProperUserId: 'fcc-2'
      } as Awaited<ReturnType<typeof prisma.user.findUnique>>);

      expect(await getServerSideProps(context)).toEqual({ notFound: true });
      expect(fetchClassroomStudentData).not.toHaveBeenCalled();
    });

    it('returns 404 for an email with no user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      expect(await getServerSideProps(context)).toEqual({ notFound: true });
      expect(fetchClassroomStudentData).not.toHaveBeenCalled();
    });

    it('shows the placeholder for a student with no fCC account link', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'student@example.org',
        fccProperUserId: null
      } as Awaited<ReturnType<typeof prisma.user.findUnique>>);

      const result = (await getServerSideProps(context)) as unknown as {
        props: { studentData: unknown };
      };

      expect(fetchClassroomStudentData).not.toHaveBeenCalled();
      expect(result.props.studentData).toEqual({
        email: 'student@example.org',
        certifications: []
      });
    });

    it('loads progress for a student in the class', async () => {
      const student = {
        id: 'user-1',
        email: 'student@example.org',
        fccProperUserId: 'fcc-1'
      };
      const progress = { email: 'student@example.org', certifications: [] };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        student as Awaited<ReturnType<typeof prisma.user.findUnique>>
      );
      vi.mocked(fetchClassroomStudentData).mockResolvedValue([progress]);

      const result = (await getServerSideProps(context)) as unknown as {
        props: { studentData: unknown };
      };

      expect(fetchClassroomStudentData).toHaveBeenCalledWith([student]);
      expect(result.props.studentData).toBe(progress);
    });
  });
});

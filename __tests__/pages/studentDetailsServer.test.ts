import { getServerSideProps } from '../../pages/dashboard/v2/details/[id]/[studentEmail]';
import type { GetServerSidePropsContext } from 'next';
import type { Session } from 'next-auth';
import prisma from '../../prisma/prisma';
import { getSessionUser } from '../../util/pageAuth';
import { getIndividualStudentData } from '../../util/student/getIndividualStudentData';

vi.mock('../../util/pageAuth', () => ({ getSessionUser: vi.fn() }));
vi.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    user: { findFirst: vi.fn() },
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
    vi.mocked(prisma.classroom.findUnique).mockImplementation((async ({
      select
    }: {
      select: Record<string, boolean>;
    }) => {
      if (select.classroomTeacherId) {
        return { classroomTeacherId: 'teacher-1' };
      }
      if (select.classroomName) {
        return { classroomName: 'Period 3' };
      }
      return { fccCertifications: ['responsive-web-design'] };
    }) as unknown as typeof prisma.classroom.findUnique);
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

  it('returns notFound when the classroom name lookup finds nothing', async () => {
    vi.mocked(prisma.classroom.findUnique)
      .mockResolvedValueOnce({
        classroomTeacherId: 'teacher-1'
      } as unknown as ClassroomLookup)
      .mockResolvedValueOnce(null);

    expect(await getServerSideProps(context)).toEqual({ notFound: true });
  });

  it('returns notFound when the certification lookup finds nothing', async () => {
    vi.mocked(prisma.classroom.findUnique)
      .mockResolvedValueOnce({
        classroomTeacherId: 'teacher-1'
      } as unknown as ClassroomLookup)
      .mockResolvedValueOnce({
        classroomName: 'Period 3'
      } as unknown as ClassroomLookup)
      .mockResolvedValueOnce(null);

    expect(await getServerSideProps(context)).toEqual({ notFound: true });
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
});

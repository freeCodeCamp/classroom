/**
 * @jest-environment node
 */
import { getServerSideProps } from '../../pages/dashboard/v2/[id]';
import { getSession } from 'next-auth/react';
import prisma from '../../prisma/prisma';
import { getSuperBlockJsons } from '../../util/legacy/getSuperBlockJsons';
import {
  fetchClassroomStudentData,
  fetchStudentData
} from '../../util/student/fetchStudentData';

jest.mock('next-auth/react', () => ({ getSession: jest.fn() }));
jest.mock('../../prisma/prisma', () => ({
  __esModule: true,
  default: {
    User: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
    classroom: { findUnique: jest.fn() }
  }
}));
jest.mock(
  '../../util/curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray',
  () => ({
    getAllTitlesAndDashedNamesSuperblockJSONArray: jest.fn(async () => [])
  })
);
jest.mock('../../util/legacy/getDashedNamesURLs', () => ({
  getDashedNamesURLs: jest.fn(async names => names)
}));
jest.mock('../../util/legacy/getSuperBlockJsons', () => ({
  getSuperBlockJsons: jest.fn(async () => [])
}));
jest.mock('../../util/dashboard/createSuperblockDashboardObject', () => ({
  createSuperblockDashboardObject: jest.fn(async () => [])
}));
jest.mock('../../util/student/fetchStudentData', () => ({
  fetchStudentData: jest.fn(),
  fetchClassroomStudentData: jest.fn()
}));

const context = {
  params: { id: 'class-1' },
  req: { headers: { host: 'localhost:3001' } }
};

const mockStudents = [
  { email: 'student[A]@gmail.com', certifications: [] },
  { email: 'student[B]@gmail.com', certifications: [] }
];

describe('class page getServerSideProps', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.FCC_API_URL;
    delete process.env.CLASSROOM_APP_BASE_URL;
    delete process.env.NEXTAUTH_URL;
    jest.spyOn(console, 'error').mockImplementation(() => {});

    getSession.mockResolvedValue({ user: { email: 'teacher@example.org' } });
    prisma.User.findMany.mockResolvedValue([{ id: 'teacher-1' }]);
    prisma.classroom.findUnique.mockImplementation(async ({ select }) =>
      select.classroomTeacherId
        ? { classroomTeacherId: 'teacher-1' }
        : {
            classroomName: 'Period 3',
            description: '',
            createdAt: new Date('2026-09-02'),
            fccCertifications: ['responsive-web-design'],
            fccUserIds: []
          }
    );
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // Regression test: mock mode used to hide the mock students behind
  // "No students yet" whenever nobody had joined the class.
  it('shows every mock student in mock mode, even with no one enrolled', async () => {
    fetchStudentData.mockResolvedValue({ error: null, data: mockStudents });

    const { props } = await getServerSideProps(context);

    expect(props.isEmpty).toBe(false);
    expect(props.studentCount).toBe(2);
    expect(props.studentData).toHaveLength(2);
  });

  it('counts enrolled students when using the fCC API', async () => {
    process.env.FCC_API_URL = 'http://localhost:3000';
    prisma.user.findMany.mockResolvedValue([]);
    fetchClassroomStudentData.mockResolvedValue([]);

    const { props } = await getServerSideProps(context);

    expect(props.isEmpty).toBe(true);
    expect(props.studentCount).toBe(0);
    expect(fetchStudentData).not.toHaveBeenCalled();
  });

  it('reports a fetch error instead of crashing when the curriculum fails', async () => {
    fetchStudentData.mockResolvedValue({ error: null, data: mockStudents });
    getSuperBlockJsons.mockRejectedValueOnce(new Error('GraphQL down'));

    const { props } = await getServerSideProps(context);

    expect(props.fetchError).toBe('FETCH_FAILED');
    expect(props.isEmpty).toBe(false);
  });

  it('reports a fetch error when the fCC API fails', async () => {
    process.env.FCC_API_URL = 'http://localhost:3000';
    prisma.user.findMany.mockResolvedValue([]);
    fetchClassroomStudentData.mockRejectedValue(new Error('503'));

    const { props } = await getServerSideProps(context);

    expect(props.fetchError).toBe('FETCH_FAILED');
  });

  it('builds the invite link from the configured app URL', async () => {
    process.env.CLASSROOM_APP_BASE_URL = 'https://classroom.freecodecamp.org';
    fetchStudentData.mockResolvedValue({ error: null, data: [] });

    const { props } = await getServerSideProps(context);

    expect(props.joinLink).toBe(
      'https://classroom.freecodecamp.org/join/class-1'
    );
  });
});

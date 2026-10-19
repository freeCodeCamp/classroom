import Head from 'next/head';
import Layout from '../../../components/layout';
import Navbar from '../../../components/navbar';
import GlobalDashboardTable from '../../../components/dashtable_v2';
import React from 'react';
import { Alert, Callout } from '@freecodecamp/ui';
import ClassroomHeader from '../../../components/ClassroomHeader';
import { getAllTitlesAndDashedNamesSuperblockJSONArray } from '../../../util/curriculum/getAllTitlesAndDashedNamesSuperblockJSONArray';
import { createSuperblockDashboardObject } from '../../../util/dashboard/createSuperblockDashboardObject';
import { getTotalChallengesForSuperblocks } from '../../../util/student/calculateProgress';
import {
  fetchClassroomStudentData,
  fetchStudentData
} from '../../../util/student/fetchStudentData';
import { checkIfStudentHasProgressDataForSuperblocksSelectedByTeacher } from '../../../util/student/checkIfStudentHasProgressDataForSuperblocksSelectedByTeacher';
import redirectUser from '../../../util/redirectUser';
import { getSessionUser } from '../../../util/pageAuth';
import prisma from '../../../prisma/prisma';
import { getAppBaseUrl } from '../../../util/getAppBaseUrl';

// NOTE: These functions are deprecated for v9 curriculum (no individual REST API JSON files)
import { getDashedNamesURLs } from '../../../util/legacy/getDashedNamesURLs';
import { getSuperBlockJsons } from '../../../util/legacy/getSuperBlockJsons';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { Session } from 'next-auth';
import type { DashboardBlock } from '../../../types/curriculum';
import type { StudentDashboardData } from '../../../types/student';

type ClassDashboardProps = {
  userSession: Session;
  classroomId: string;
  totalChallenges: number;
  studentData: StudentDashboardData[];
  studentsAreEnrolledInSuperblocks: boolean[][];
  fetchError: string | null;
  isEmpty: boolean;
  joinLink: string;
  classroomName: string;
  description: string;
  certificationTitles: string[];
  studentCount: number;
  createdDate: string | null;
};

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<ClassDashboardProps>> {
  //making sure User is the teacher of this classsroom's dashboard
  const sessionUser = await getSessionUser(context);
  if (!sessionUser) return redirectUser('/error');
  const { session: userSession, user } = sessionUser;

  const classroom = await prisma.classroom.findUnique({
    where: {
      classroomId: String(context.params?.id)
    },
    select: {
      classroomTeacherId: true,
      classroomName: true,
      description: true,
      createdAt: true,
      fccCertifications: true,
      fccUserIds: true
    }
  });

  if (classroom === null || user.id !== classroom.classroomTeacherId) {
    return redirectUser('/classes');
  }

  // Readable certification names for the header, using the same curriculum
  // lookup as /classes. Falls back to dashed names if it's unavailable.
  let certificationTitles = classroom.fccCertifications;
  try {
    const superblocks = await getAllTitlesAndDashedNamesSuperblockJSONArray();
    const titlesByDashedName = Object.fromEntries(
      superblocks.map(superblock => [superblock.dashedName, superblock.title])
    );
    certificationTitles = classroom.fccCertifications.map(
      dashedName => titlesByDashedName[dashedName] ?? dashedName
    );
  } catch (error) {
    console.error(
      'Unable to load certification titles for the class page',
      error
    );
  }

  // Curriculum (GraphQL) and student progress (fCC API or mock data) both
  // come from outside services. A failure in either becomes fetchError
  // instead of crashing the page.
  let fetchError: string | null = null;
  let dashboardObjs: DashboardBlock[][] = [];
  let totalChallenges = 0;
  let studentData: StudentDashboardData[] | null = null;
  try {
    const superblockURLS = await getDashedNamesURLs(
      classroom.fccCertifications
    );

    const superBlockJsons = await getSuperBlockJsons(superblockURLS); // this is an array of urls
    dashboardObjs = await createSuperblockDashboardObject(superBlockJsons);

    totalChallenges = getTotalChallengesForSuperblocks(dashboardObjs);

    // Student completion data comes from the fCC API, or from mock data when
    // FCC_API_URL isn't configured (local development).
    const students = await prisma.user.findMany({
      where: { id: { in: classroom.fccUserIds } },
      select: { id: true, email: true, fccProperUserId: true }
    });
    if (process.env.FCC_API_URL) {
      studentData = await fetchClassroomStudentData(students);
    } else {
      const mock = await fetchStudentData();
      fetchError = mock.error;
      // Mock mode shows the students in this class, using their mock
      // progress record when the mock data has one.
      studentData =
        mock.data &&
        students.map(
          student =>
            mock.data?.find(record => record.email === student.email) ?? {
              email: student.email ?? '',
              certifications: []
            }
        );
    }
  } catch (error) {
    console.error('Unable to load student progress for the class page', error);
    fetchError = 'FETCH_FAILED';
  }
  const safeStudentData = studentData ?? [];

  // Temporary check to map/accomodate hard-coded mock student data progress in unselected superblocks by teacher
  const studentsAreEnrolledInSuperblocks =
    checkIfStudentHasProgressDataForSuperblocksSelectedByTeacher(
      safeStudentData,
      dashboardObjs
    );
  if (Array.isArray(safeStudentData)) {
    safeStudentData.forEach((studentJSON, indexToCheckProgress) => {
      const enrollStatus =
        studentsAreEnrolledInSuperblocks[indexToCheckProgress] || [];
      const isStudentEnrolledInAtLeastOneSuperblock = enrollStatus.some(
        val => val === true
      );

      if (!isStudentEnrolledInAtLeastOneSuperblock) {
        studentJSON.certifications = [];
      } else if (Array.isArray(studentJSON.certifications)) {
        // Filter out certifications that are not selected by the teacher
        studentJSON.certifications = studentJSON.certifications.filter(
          (certification, certIndex) => {
            return enrollStatus[certIndex];
          }
        );
      } else {
        studentJSON.certifications = [];
      }
    });
  }

  const joinLink = `${getAppBaseUrl(context.req)}/join/${String(context.params?.id)}`;

  const studentCount = classroom.fccUserIds.length;

  return {
    props: {
      userSession,
      classroomId: String(context.params?.id),
      studentData: safeStudentData,
      totalChallenges: totalChallenges,
      studentsAreEnrolledInSuperblocks,
      fetchError: fetchError ?? null,
      isEmpty: !fetchError && studentCount === 0,
      joinLink,
      classroomName: classroom.classroomName,
      description: classroom.description ?? '',
      certificationTitles: [...new Set(certificationTitles)],
      studentCount,
      createdDate: classroom.createdAt
        ? classroom.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
          })
        : null
    }
  };
}

export default function Home({
  userSession,
  classroomId,
  totalChallenges,
  studentData,
  fetchError,
  isEmpty,
  joinLink,
  classroomName,
  description,
  certificationTitles,
  studentCount,
  createdDate
}: ClassDashboardProps): React.JSX.Element {
  return (
    <Layout>
      <Head>
        <title>{`${classroomName} | freeCodeCamp Classroom`}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {userSession && (
        <>
          <Navbar />
          <main className='max-w-5xl mx-auto px-4 py-10'>
            <ClassroomHeader
              classroomName={classroomName}
              description={description}
              certificationTitles={certificationTitles}
              studentCount={studentCount}
              createdDate={createdDate}
              joinLink={joinLink}
            />

            <h2>Students</h2>
            {isEmpty ? (
              <Callout variant='note' label='No students yet'>
                <p className='mb-0'>
                  Share the invite link above. Students appear here after they
                  open it, sign in, and select Connect to Classroom.
                </p>
              </Callout>
            ) : fetchError && fetchError !== 'MISSING_URL' ? (
              <Alert variant='danger'>
                <p className='mb-0'>
                  We couldn&apos;t load your students. Please try refreshing, or
                  contact support at{' '}
                  <a href='mailto:support@freecodecamp.org'>
                    support@freecodecamp.org
                  </a>{' '}
                  if the problem persists.
                </p>
              </Alert>
            ) : (
              <GlobalDashboardTable
                classroomId={classroomId}
                totalChallenges={totalChallenges}
                studentData={studentData}
              ></GlobalDashboardTable>
            )}
          </main>
        </>
      )}
    </Layout>
  );
}

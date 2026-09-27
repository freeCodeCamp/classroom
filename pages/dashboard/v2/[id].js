import Head from 'next/head';
import Layout from '../../../components/layout';
import Navbar from '../../../components/navbar';
import { getSession } from 'next-auth/react';
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
import redirectUser from '../../../util/redirectUser.js';

// NOTE: These functions are deprecated for v9 curriculum (no individual REST API JSON files)
import { getDashedNamesURLs } from '../../../util/legacy/getDashedNamesURLs';
import { getSuperBlockJsons } from '../../../util/legacy/getSuperBlockJsons';

export async function getServerSideProps(context) {
  // Dynamic import to prevent Prisma from being bundled for client
  const { default: prisma } = await import('../../../prisma/prisma');

  //making sure User is the teacher of this classsroom's dashboard
  const userSession = await getSession(context);
  if (!userSession) {
    return redirectUser('/error');
  }

  const userEmail = await prisma.User.findMany({
    where: {
      email: userSession['user']['email']
    }
  });

  const classroomTeacherId = await prisma.classroom.findUnique({
    where: {
      classroomId: context.params.id
    },
    select: {
      classroomTeacherId: true
    }
  });

  if (
    classroomTeacherId == null ||
    userEmail[0].id == null ||
    userEmail[0].id !== classroomTeacherId['classroomTeacherId']
  ) {
    return redirectUser('/classes');
  }

  const certificationNumbers = await prisma.classroom.findUnique({
    where: {
      classroomId: context.params.id
    },
    select: {
      classroomName: true,
      description: true,
      createdAt: true,
      fccCertifications: true,
      fccUserIds: true
    }
  });

  // Readable certification names for the header, using the same curriculum
  // lookup as /classes. Falls back to dashed names if it's unavailable.
  let certificationTitles = certificationNumbers.fccCertifications;
  try {
    const superblocks = await getAllTitlesAndDashedNamesSuperblockJSONArray();
    const titlesByDashedName = Object.fromEntries(
      superblocks.map(superblock => [superblock.dashedName, superblock.title])
    );
    certificationTitles = certificationNumbers.fccCertifications.map(
      dashedName => titlesByDashedName[dashedName] ?? dashedName
    );
  } catch (error) {
    console.error(
      'Unable to load certification titles for the class page',
      error
    );
  }

  let superblockURLS = await getDashedNamesURLs(
    certificationNumbers.fccCertifications
  );

  let superBlockJsons = await getSuperBlockJsons(superblockURLS); // this is an array of urls
  let dashboardObjs = await createSuperblockDashboardObject(superBlockJsons);

  let totalChallenges = getTotalChallengesForSuperblocks(dashboardObjs);

  // Fetch student completion data from the fCC API, or from mock data when
  // FCC_API_URL isn't configured (local development). Either way a failure
  // becomes fetchError instead of crashing the page.
  let fetchError = null;
  let studentData = null;
  if (process.env.FCC_API_URL) {
    try {
      const students = await prisma.user.findMany({
        where: { id: { in: certificationNumbers.fccUserIds } },
        select: { id: true, email: true, fccProperUserId: true }
      });
      studentData = await fetchClassroomStudentData(students);
    } catch (error) {
      console.error('Unable to fetch student data from the fCC API', error);
      fetchError = 'FETCH_FAILED';
    }
  } else {
    ({ error: fetchError, data: studentData } = await fetchStudentData());
  }
  const safeStudentData = studentData ?? [];

  // Temporary check to map/accomodate hard-coded mock student data progress in unselected superblocks by teacher
  let studentsAreEnrolledInSuperblocks =
    checkIfStudentHasProgressDataForSuperblocksSelectedByTeacher(
      safeStudentData,
      dashboardObjs
    );
  if (Array.isArray(safeStudentData)) {
    safeStudentData.forEach((studentJSON, indexToCheckProgress) => {
      let enrollStatus =
        studentsAreEnrolledInSuperblocks[indexToCheckProgress] || [];
      let isStudentEnrolledInAtLeastOneSuperblock = enrollStatus.some(
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

  const protocol = context.req.headers['x-forwarded-proto'] ?? 'http';
  const host = context.req.headers.host;
  const joinLink = `${protocol}://${host}/join/${context.params.id}`;

  return {
    props: {
      userSession,
      classroomId: context.params.id,
      studentData: safeStudentData,
      totalChallenges: totalChallenges,
      studentsAreEnrolledInSuperblocks,
      fetchError: fetchError ?? null,
      isEmpty: certificationNumbers.fccUserIds.length === 0,
      joinLink,
      classroomName: certificationNumbers.classroomName,
      description: certificationNumbers.description ?? '',
      certificationTitles: [...new Set(certificationTitles)],
      studentCount: certificationNumbers.fccUserIds.length,
      createdDate: certificationNumbers.createdAt
        ? certificationNumbers.createdAt.toLocaleDateString('en-US', {
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
  studentsAreEnrolledInSuperblocks,
  fetchError,
  isEmpty,
  joinLink,
  classroomName,
  description,
  certificationTitles,
  studentCount,
  createdDate
}) {
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
                studentsAreEnrolledInSuperblocks={
                  studentsAreEnrolledInSuperblocks
                }
              ></GlobalDashboardTable>
            )}
          </main>
        </>
      )}
    </Layout>
  );
}

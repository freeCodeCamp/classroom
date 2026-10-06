import Head from 'next/head';
import Layout from '../../../../../components/layout';
import Navbar from '../../../../../components/navbar';
import { getSession } from 'next-auth/react';
import { Alert } from '@freecodecamp/ui';
import { createSuperblockDashboardObject } from '../../../../../util/dashboard/createSuperblockDashboardObject';
import { getSuperblockTitlesInClassroomByIndex } from '../../../../../util/curriculum/getSuperblockTitlesInClassroomByIndex';
import { getIndividualStudentData } from '../../../../../util/student/getIndividualStudentData';
import { fetchClassroomStudentData } from '../../../../../util/student/fetchStudentData';
import React from 'react';
import redirectUser from '../../../../../util/redirectUser.js';
import DetailsDashboard from '../../../../../components/DetailsDashboard';

// NOTE: These functions are deprecated for v9 curriculum (no individual REST API JSON files)
import { getDashedNamesURLs } from '../../../../../util/legacy/getDashedNamesURLs';
import { getSuperBlockJsons } from '../../../../../util/legacy/getSuperBlockJsons';

export async function getServerSideProps(context) {
  // Dynamic import to prevent Prisma from being bundled for client
  const { default: prisma } = await import('../../../../../prisma/prisma');

  //making sure User is the teacher of this classsroom's dashboard
  const userSession = await getSession(context);

  const studentEmail = context.params.studentEmail;
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

  const classroomName = await prisma.classroom.findUnique({
    where: {
      classroomId: context.params.id
    },
    select: {
      classroomName: true
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
      fccCertifications: true
    }
  });

  // Curriculum (GraphQL) and student progress (fCC API or mock data) both
  // come from outside services. If either fails, the page shows fetchError
  // instead of crashing.
  let fetchError = null;
  let superblockTitles = [];
  let superblocksDetailsJSONArray = [];
  let studentData = { email: studentEmail, certifications: [] };
  try {
    superblockTitles = await getSuperblockTitlesInClassroomByIndex(
      certificationNumbers.fccCertifications
    );

    let superblockURLS = await getDashedNamesURLs(
      certificationNumbers.fccCertifications
    );

    let superBlockJsons = await getSuperBlockJsons(superblockURLS); // this is an array of urls
    superblocksDetailsJSONArray =
      await createSuperblockDashboardObject(superBlockJsons);

    // Fetch individual student data from fCC API (falls back to mock data
    // if FCC_API_URL is not configured, for local development).
    if (process.env.FCC_API_URL) {
      const student = await prisma.user.findFirst({
        where: { email: studentEmail },
        select: { id: true, email: true, fccProperUserId: true }
      });
      if (student?.fccProperUserId) {
        const results = await fetchClassroomStudentData([student]);
        studentData = results[0] || studentData;
      }
    } else {
      studentData = await getIndividualStudentData(studentEmail);
    }
  } catch (error) {
    console.error(
      'Unable to load progress for the student details page',
      error
    );
    fetchError = 'FETCH_FAILED';
  }

  return {
    props: {
      userSession,
      studentEmail,
      superblockTitles,
      superblocksDetailsJSONArray,
      studentData,
      fetchError,
      classroomName: classroomName.classroomName,
      classroomID: context.params.id
    }
  };
}

export default function StudentDetails({
  userSession,
  studentEmail,
  superblocksDetailsJSONArray,
  superblockTitles,
  studentData,
  fetchError,
  classroomName,
  classroomID
}) {
  return (
    <Layout>
      <Head>
        <title>{`${studentEmail} | freeCodeCamp Classroom`}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {userSession && (
        <>
          <Navbar
            extraLinks={[
              { href: `/dashboard/v2/${classroomID}`, label: 'Back to class' }
            ]}
          />
          <main className='max-w-4xl mx-auto px-4 py-10'>
            <h1 className='big-heading'>{studentEmail}</h1>
            <p>Progress in {classroomName}</p>

            {fetchError ? (
              <Alert variant='danger'>
                <p className='mb-0'>
                  We couldn&apos;t load this student&apos;s progress. Please try
                  refreshing, or contact support at{' '}
                  <a href='mailto:support@freecodecamp.org'>
                    support@freecodecamp.org
                  </a>{' '}
                  if the problem persists.
                </p>
              </Alert>
            ) : (
              <DetailsDashboard
                superblocksDetailsJSONArray={superblocksDetailsJSONArray}
                superblockTitles={superblockTitles}
                studentData={studentData}
              ></DetailsDashboard>
            )}
          </main>
        </>
      )}
    </Layout>
  );
}

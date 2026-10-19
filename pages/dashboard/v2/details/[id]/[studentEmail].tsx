import Head from 'next/head';
import Layout from '../../../../../components/layout';
import Navbar from '../../../../../components/navbar';
import { Alert } from '@freecodecamp/ui';
import { createSuperblockDashboardObject } from '../../../../../util/dashboard/createSuperblockDashboardObject';
import { getSuperblockTitlesInClassroomByIndex } from '../../../../../util/curriculum/getSuperblockTitlesInClassroomByIndex';
import { getIndividualStudentData } from '../../../../../util/student/getIndividualStudentData';
import { fetchClassroomStudentData } from '../../../../../util/student/fetchStudentData';
import React from 'react';
import redirectUser from '../../../../../util/redirectUser';
import { getSessionUser } from '../../../../../util/pageAuth';
import prisma from '../../../../../prisma/prisma';
import DetailsDashboard from '../../../../../components/DetailsDashboard';

// NOTE: These functions are deprecated for v9 curriculum (no individual REST API JSON files)
import { getDashedNamesURLs } from '../../../../../util/legacy/getDashedNamesURLs';
import { getSuperBlockJsons } from '../../../../../util/legacy/getSuperBlockJsons';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { Session } from 'next-auth';
import type { DashboardBlock } from '../../../../../types/curriculum';
import type { StudentDashboardData } from '../../../../../types/student';

type StudentDetailsProps = {
  userSession: Session;
  studentEmail: string;
  superblockTitles: string[];
  superblocksDetailsJSONArray: DashboardBlock[][];
  studentData: StudentDashboardData;
  fetchError: string | null;
  classroomName: string;
  classroomID: string;
};

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<StudentDetailsProps>> {
  //making sure User is the teacher of this classsroom's dashboard
  const studentEmail = String(context.params?.studentEmail);
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
      fccCertifications: true,
      fccUserIds: true
    }
  });

  if (classroom === null || user.id !== classroom.classroomTeacherId) {
    return redirectUser('/classes');
  }

  // Only students in this class have a details page, in mock mode too.
  const useFccApi = Boolean(process.env.FCC_API_URL);
  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
    select: { id: true, email: true, fccProperUserId: true }
  });
  if (!student || !classroom.fccUserIds.includes(student.id)) {
    return { notFound: true };
  }

  // Curriculum (GraphQL) and student progress (fCC API or mock data) both
  // come from outside services. If either fails, the page shows fetchError
  // instead of crashing.
  let fetchError: string | null = null;
  let superblockTitles: string[] = [];
  let superblocksDetailsJSONArray: DashboardBlock[][] = [];
  let studentData: StudentDashboardData = {
    email: studentEmail,
    certifications: []
  };
  try {
    superblockTitles = await getSuperblockTitlesInClassroomByIndex(
      classroom.fccCertifications
    );

    const superblockURLS = await getDashedNamesURLs(
      classroom.fccCertifications
    );

    const superBlockJsons = await getSuperBlockJsons(superblockURLS); // this is an array of urls
    superblocksDetailsJSONArray =
      await createSuperblockDashboardObject(superBlockJsons);

    // Fetch individual student data from fCC API (falls back to mock data
    // if FCC_API_URL is not configured, for local development).
    if (!useFccApi) {
      studentData =
        (await getIndividualStudentData(studentEmail)) ?? studentData;
    } else if (student.fccProperUserId) {
      const results = await fetchClassroomStudentData([student]);
      studentData = results[0] || studentData;
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
      classroomName: classroom.classroomName,
      classroomID: String(context.params?.id)
    }
  };
}

export default function StudentDetails({
  userSession,
  studentEmail,
  superblocksDetailsJSONArray,
  studentData,
  fetchError,
  classroomName,
  classroomID
}: StudentDetailsProps): React.JSX.Element {
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
                studentData={studentData}
              ></DetailsDashboard>
            )}
          </main>
        </>
      )}
    </Layout>
  );
}

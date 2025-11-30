// pages/dashboard/v2/[id].js
import Head from 'next/head';
import Layout from '../../../components/layout';
import Link from 'next/link';
import Navbar from '../../../components/navbar';
import prisma from '../../../prisma/prisma';
import { getSession } from 'next-auth/react';
import { fetchStudentData } from '../../../util/api_proccesor';
import redirectUser from '../../../util/redirectUser';

export async function getServerSideProps(context) {
  const userSession = await getSession(context);
  if (!userSession) {
    return redirectUser('/error');
  }

  // ✅ get teacher by email
  const userEmail = await prisma.User.findMany({
    where: { email: userSession.user.email }
  });

  // ✅ classroom teacher ID
  const classroomTeacherId = await prisma.classroom.findUnique({
    where: { classroomId: context.params.id },
    select: { classroomTeacherId: true }
  });

  // ✅ verify teacher
  if (
    !userEmail.length ||
    userEmail[0].id !== classroomTeacherId.classroomTeacherId
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

  let superblockURLS = await getDashedNamesURLs(
    certificationNumbers.fccCertifications
  );

  let superBlockJsons = await getSuperBlockJsons(superblockURLS); // this is an array of urls
  let dashboardObjs = await createSuperblockDashboardObject(superBlockJsons);

  let totalChallenges = getTotalChallengesForSuperblocks(dashboardObjs);

  let studentData = await fetchStudentData();

  // Temporary check to map/accomodate hard-coded mock student data progress in unselected superblocks by teacher
  let studentsAreEnrolledInSuperblocks =
    checkIfStudentHasProgressDataForSuperblocksSelectedByTeacher(
      studentData,
      dashboardObjs
    );
  studentData.forEach(studentJSON => {
    let indexToCheckProgress = studentData.indexOf(studentJSON);
    let isStudentEnrolledInAtLeastOneSuperblock =
      studentsAreEnrolledInSuperblocks[indexToCheckProgress].some(
        val => val === true
      );

    if (!isStudentEnrolledInAtLeastOneSuperblock) {
      studentData[indexToCheckProgress].certifications = [];
    } else {
      // Filter out certifications that are not selected by the teacher
      studentJSON.certifications = studentJSON.certifications.filter(
        (certification, certIndex) => {
          return studentsAreEnrolledInSuperblocks[indexToCheckProgress][
            certIndex
          ];
        }
      );
    }
  });

  return {
    props: {
      userSession,
      data: currStudentData
    }
  };
}

export default function DashboardPage({ userSession, data }) {
  return (
    <Layout>
      <Head>
        <title>Classroom Dashboard</title>
        <meta name='description' content='Classroom dashboard' />
      </Head>

      {userSession && (
        <>
          <Navbar>
            <div className='border p-2'>
              <Link href='/classes'>Classes</Link>
            </div>
            <div className='border p-2'>
              <Link href='/'>Menu</Link>
            </div>
          </Navbar>

          {/* ✅ Simple student list */}
          <div className='mt-6'>
            <h2 className='text-lg font-bold'>Enrolled Students</h2>
            {data.length > 0 ? (
              <ul>
                {data.map(s => (
                  <li key={s.id}>
                    {s.name} ({s.email})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No students enrolled in this class.</p>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}

import Head from 'next/head';
import Layout from '../../components/layout';
import Link from 'next/link';
import Navbar from '../../components/navbar';
import prisma from '../../prisma/prisma';
import DashTabs from '../../components/dashtabs';
import { getSession } from 'next-auth/react';

export async function getServerSideProps(context) {
  //making sure User is the teacher of this classsroom's dashboard
  const userSession = await getSession(context);
  if (!userSession) {
    context.res.writeHead(302, { Location: '/' });
    context.res.end();
    return {};
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

  if (userEmail[0].id !== classroomTeacherId['classroomTeacherId']) {
    context.res.writeHead(302, { Location: '/classes' });
    context.res.end();
    return {};
  }
  /* 
    Below we create a json that react-data-table can use to create the rows of our table.

    First we ask the database which superblocks we need to get the data from.
     The URL of the page looks like /dashboard/<CLASSROOM_ID> where CLASSROOM ID corresponds with classroomId in our database
     Each classroom object in our database has an array fccCertifications where each number in that array corresponds to an index in the availableSuperBlocks.json file
  */

  const certificationNumbers = await prisma.classroom.findUnique({
    where: {
      classroomId: context.params.id
    },
    select: {
      fccCertifications: true
    }
  });

  //base URL of freecodecamp's API
  const fcc_base_url = 'https://www.freecodecamp.org/mobile/';

  //url of all the superblocks
  const superblocksres = await fetch(
    'https://www.freecodecamp.org/mobile/availableSuperblocks.json'
  );
  const superblocksreq = await superblocksres.json();

  //1 in the certification numbers will correspond with the first superblock name we get from freecodeCamp for example
  //we add the name that we get from the availableSuperBlocks to the base url to get the url that will give us the data from a specific superblock

  let superblockUrls = certificationNumbers['fccCertifications'].map(
    x => fcc_base_url + superblocksreq['superblocks'][0][x] + '.json'
  );
  let names = certificationNumbers['fccCertifications'].map(
    x => superblocksreq['superblocks'][1][x]
  );

  let jsonResponses = await Promise.all(
    superblockUrls.map(async i => {
      let myUrl = await fetch(i);
      let myJSON = myUrl.json();
      return myJSON;
    })
  );

  let blocks = jsonResponses.map(x => {
    return x;
  });

  //sortedBlocks is what is passed through props to our table component
  let sortedBlocks = blocks.map(block => {
    let currBlock = Object.keys(block).map(nestedBlock => {
      let classCertification = Object.entries(block[nestedBlock]['blocks']).map(
        ([x]) => {
          return [
            {
              name: block[nestedBlock]['blocks'][x]['challenges']['name'],
              selector: x,
              allChallenges: block[nestedBlock]['blocks'][x]['challenges'][
                'challengeOrder'
              ].map(x => x[0])
            },
            block[nestedBlock]['blocks'][x]['challenges']['order']
          ];
        }
      );
      classCertification.sort(function (a, b) {
        if (a[1] === b[1]) {
          return 0;
        } else {
          return a[1] < b[1] ? -1 : 1;
        }
      });
      //this gets us the first column of our 2d array
      const arrayColumn = (arr, n) => arr.map(x => x[n]);
      classCertification = arrayColumn(classCertification, 0);
      return classCertification;
    });
    return currBlock;
  });

  //getting all users UUIDs from the classroom object
  const userUUIDs = await prisma.classroom.findMany({
    where: {
      classroomId: context.params.id
    },
    select: {
      fccUserIds: true
    }
  });

  const idList = userUUIDs.at(0)['fccUserIds'];

  //getting user jsons

  const USER_BASE_URL = 'http://localhost:3001/getProfileData?uuid=';

  const userDataUrls = idList.map(x => USER_BASE_URL + x);

  jsonResponses = await Promise.all(
    userDataUrls.map(async i => {
      let myUrl = await fetch(i);
      let myJSON = myUrl.json();
      return myJSON;
    })
  );

  let nameDataPairs = jsonResponses.map(x => {
    let out = {};
    out[x[0]['name']] = x[0]['completedChallenges'].map(x => x['id']);
    return out;
  });

  return {
    props: {
      userSession,
      columns: sortedBlocks,
      certificationNames: names,
      nameDataPairs
    }
  };
}

export default function Home({
  userSession,
  columns,
  certificationNames,
  nameDataPairs
}) {
  let tabNames = certificationNames;
  let columnNames = columns;

  return (
    <Layout>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {userSession && (
        <>
          <Navbar>
            <div className='border-solid border-2 pl-4 pr-4'>
              <Link href={'/classes'}>Classes</Link>
            </div>
            <div className='border-solid border-2 pl-4 pr-4'>
              <Link href={'/'}> Menu</Link>
            </div>
            <div className='hover:bg-[#ffbf00] shadedow-lg border-solid border-color: inherit; border-2 pl-4 pr-4 bg-[#f1be32] text-black'>
              <Link href={'/'}>Sign out</Link>
            </div>
          </Navbar>
          <DashTabs
            columns={columnNames}
            certificationNames={tabNames}
            data={nameDataPairs}
          ></DashTabs>
        </>
      )}
    </Layout>
  );
}

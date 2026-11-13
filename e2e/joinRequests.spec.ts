import { expect, test } from '@playwright/test';
import type {
  APIRequestContext,
  Browser,
  BrowserContext
} from '@playwright/test';
import { signInAs } from './helpers';

const TEACHER_EMAIL = 'teacher@classroom.local';
const STUDENT_EMAIL = `e2e-student-${Date.now()}@classroom.local`;

const openContexts: BrowserContext[] = [];

test.afterEach(async () => {
  await Promise.all(openContexts.splice(0).map(context => context.close()));
});

async function signedInRequest(
  browser: Browser,
  email: string
): Promise<APIRequestContext> {
  const context = await browser.newContext();
  openContexts.push(context);
  const page = await context.newPage();
  await signInAs(page, email, '/');
  return page.request;
}

test('teacher approves, declines and removes students', async ({ browser }) => {
  const teacher = await signedInRequest(browser, TEACHER_EMAIL);
  const student = await signedInRequest(browser, STUDENT_EMAIL);

  const { user } = await (await teacher.get('/api/auth/session')).json();
  const created = await teacher.post('/api/create_class_teacher', {
    data: {
      classroomName: `E2E join requests ${Date.now()}`,
      description: 'Join request flow',
      classroomTeacherId: user.id,
      fccCertifications: []
    }
  });
  expect(created.ok()).toBe(true);
  const { classroomId } = await created.json();

  const setJoinMode = async (joinMode: string) => {
    const edited = await teacher.put('/api/editclass', {
      data: { classroomId, joinMode }
    });
    expect(edited.ok()).toBe(true);
  };
  const join = async () => {
    const joined = await student.put('/api/student_email_join', {
      data: { classroomId }
    });
    expect(joined.ok()).toBe(true);
    return joined.json();
  };
  const decide = async (decision: string, userId: string) =>
    (
      await teacher.put('/api/join_request', {
        data: { classroomId, userId, decision }
      })
    ).status();
  const studentRole = async (): Promise<string> =>
    (await (await student.get('/api/auth/session')).json()).user.role;
  const remove = async () =>
    (
      await teacher.delete('/api/remove_student', {
        data: { classroomId, studentEmail: STUDENT_EMAIL }
      })
    ).status();

  try {
    await setJoinMode('ASK_TO_JOIN');

    const request = await join();
    expect(request.status).toBe('PENDING');
    const userId: string = request.classroomAppUserId;

    expect(await studentRole()).toBe('NONE');

    expect(await decide('decline', userId)).toBe(200);
    expect(await decide('decline', userId)).toBe(404);
    expect(await remove()).toBe(404);

    expect((await join()).status).toBe('PENDING');
    expect(await decide('approve', userId)).toBe(200);
    expect(await studentRole()).toBe('STUDENT');
    expect(await decide('approve', userId)).toBe(404);
    expect((await join()).alreadyInRoster).toBe(true);

    expect(await remove()).toBe(200);
    expect(await remove()).toBe(404);

    expect((await join()).status).toBe('PENDING');
    await setJoinMode('OPEN');
    expect((await join()).status).toBe('JOINED');
    expect(await decide('approve', userId)).toBe(404);
    expect(await remove()).toBe(200);
  } finally {
    const deleted = await teacher.delete('/api/deleteclass', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(classroomId)
    });
    expect.soft(deleted.ok()).toBe(true);
  }
});

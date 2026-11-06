import { expect, test } from '@playwright/test';
import { signInAs } from './helpers';

test('classroom APIs enforce text limits and support partial edits', async ({
  page
}) => {
  await signInAs(page, 'teacher@classroom.local', '/');
  const session = await page.request.get('/api/auth/session');
  const { user } = await session.json();
  const body = {
    classroomName: 'n'.repeat(100),
    description: 'd'.repeat(500),
    classroomTeacherId: user.id,
    fccCertifications: []
  };

  for (const fields of [
    { classroomName: 'n'.repeat(101) },
    { description: 'd'.repeat(501) }
  ]) {
    const rejected = await page.request.post('/api/create_class_teacher', {
      data: { ...body, ...fields }
    });
    expect(rejected.status()).toBe(400);
  }

  const created = await page.request.post('/api/create_class_teacher', {
    data: body
  });
  expect(created.ok()).toBe(true);
  const classroom = await created.json();
  expect(classroom).toMatchObject(body);

  try {
    for (const fields of [
      { classroomName: 'n'.repeat(101) },
      { description: 'd'.repeat(501) }
    ]) {
      const rejected = await page.request.put('/api/editclass', {
        data: { classroomId: classroom.classroomId, ...fields }
      });
      expect(rejected.status()).toBe(400);
    }

    const edited = await page.request.put('/api/editclass', {
      data: { classroomId: classroom.classroomId, description: null }
    });
    expect(edited.ok()).toBe(true);
    expect(await edited.json()).toMatchObject({
      classroomName: body.classroomName,
      description: null
    });
  } finally {
    const deleted = await page.request.delete('/api/deleteclass', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(classroom.classroomId)
    });
    expect(deleted.ok()).toBe(true);
  }
});

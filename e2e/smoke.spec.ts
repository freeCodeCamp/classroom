import { expect, test } from '@playwright/test';
import { signInAs } from './helpers';

const ADMIN_EMAIL = 'admin@classroom.local';
const TEACHER_EMAIL = 'teacher@classroom.local';
const STUDENT_EMAIL = 'student@classroom.local';

test('sign in page shows the development form', async ({ page }) => {
  await page.goto('/signin');
  await expect(
    page.getByRole('heading', { name: 'Development sign in' })
  ).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveValue(TEACHER_EMAIL);
});

test('sign in button leads to the sign in page', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('main')
    .getByRole('button', { name: 'Sign in', exact: true })
    .click();
  await expect(page).toHaveURL(/\/signin(\?|$)/);
});

test('teacher sees classes', async ({ page }) => {
  await signInAs(page, TEACHER_EMAIL, '/classes');
  await expect(
    page.getByRole('heading', { name: 'Your classes' })
  ).toBeVisible();
  await expect(page.getByText('Seed classroom', { exact: true })).toBeVisible();
});

test('teacher creates a class', async ({ page }) => {
  const className = `E2E class ${Date.now()}`;
  await signInAs(page, TEACHER_EMAIL, '/classes');
  await page.getByRole('button', { name: 'Create Class' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Class Name').fill(className);
  await dialog.getByLabel('Description').fill('Placeholder description');
  await dialog.getByRole('button', { name: 'Create', exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(className, { exact: true })).toBeVisible();
});

test('teacher opens the class dashboard', async ({ page }) => {
  await signInAs(page, TEACHER_EMAIL, '/dashboard/v2/seed-classroom');
  await expect(
    page.getByRole('heading', { name: 'Students', exact: true })
  ).toBeVisible();
});

test('admin sees users', async ({ page }) => {
  await signInAs(page, ADMIN_EMAIL, '/admin');
  await expect(
    page.getByRole('heading', { name: 'Admin dashboard' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'User Database' })
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: STUDENT_EMAIL, exact: true })
  ).toBeVisible();
});

test('student is kept out of admin', async ({ page }) => {
  await signInAs(page, STUDENT_EMAIL, '/');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/error$/);
  await expect(
    page.getByRole('heading', { name: 'Student Access' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'User Database' })
  ).toBeHidden();
});

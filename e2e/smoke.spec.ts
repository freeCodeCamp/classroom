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
  await expect(
    page.getByRole('radio', { name: 'Teacher', exact: true })
  ).toBeChecked();
});

test('development sign in supports seeded roles and a custom email', async ({
  page
}) => {
  await page.goto('/signin?callbackUrl=%2Fclasses');
  await page.getByRole('radio', { name: 'Admin', exact: true }).check();
  await expect(page.getByLabel('Email')).toHaveValue(ADMIN_EMAIL);
  // Native radio buttons support arrow-key navigation as well as clicks.
  await page
    .getByRole('radio', { name: 'Admin', exact: true })
    .press('ArrowRight');
  await expect(
    page.getByRole('radio', { name: 'Teacher', exact: true })
  ).toBeChecked();
  await expect(page.getByLabel('Email')).toHaveValue(TEACHER_EMAIL);
  await page.getByRole('radio', { name: 'Student', exact: true }).check();
  await expect(page.getByLabel('Email')).toHaveValue(STUDENT_EMAIL);

  await page.getByLabel('Email').fill('new@classroom.local');
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  // Inspect the native form submission without creating a database user.
  await page.route('**/api/auth/dev-login', async route => {
    const body = new URLSearchParams(route.request().postData() ?? '');
    expect(body.get('email')).toBe('new@classroom.local');
    expect(body.get('callbackUrl')).toBe('/classes');
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'Submitted'
    });
  });
  await page
    .getByRole('main')
    .getByRole('button', { name: 'Sign in', exact: true })
    .click();
  await expect(page.getByText('Submitted', { exact: true })).toBeVisible();
});

test('sign in button leads to the sign in page', async ({ page }) => {
  await page.goto('/');
  const signInButton = page
    .getByRole('main')
    .getByRole('button', { name: 'Sign in', exact: true });
  const devHeading = page.getByRole('heading', {
    name: 'Development sign in'
  });
  await expect(async () => {
    if (!(await devHeading.isVisible())) {
      await signInButton.click({ timeout: 2_000 });
    }
    await expect(devHeading).toBeVisible({ timeout: 2_000 });
  }).toPass();
  await expect(page).toHaveURL(/^http:\/\/localhost:3001\/signin(\?|$)/);
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
  const dialog = page.getByRole('dialog');
  await expect(async () => {
    if (!(await dialog.isVisible())) {
      await page
        .getByRole('button', { name: 'Create Class' })
        .click({ timeout: 2_000 });
    }
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass();
  await dialog.getByLabel('Class Name').fill(className);
  await dialog.getByLabel('Description').fill('Placeholder description');
  await dialog.getByRole('button', { name: 'Create', exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(className, { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText(className, { exact: true })).toBeVisible();
});

test('teacher opens the class dashboard', async ({ page }) => {
  await signInAs(page, TEACHER_EMAIL, '/dashboard/v2/seed-classroom');
  await expect(
    page.getByRole('heading', { name: 'Students', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: STUDENT_EMAIL, exact: true })
  ).toBeVisible();
  await expect(page.getByText(/load your students/)).toBeHidden();
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

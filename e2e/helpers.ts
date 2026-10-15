import type { Page } from '@playwright/test';

export async function signInAs(
  page: Page,
  email: string,
  callbackUrl: string
): Promise<void> {
  await page.goto(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  const main = page.getByRole('main');
  await main.getByLabel('Email').fill(email);
  await main.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(url => url.pathname === callbackUrl);
}

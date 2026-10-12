import type { Page } from '@playwright/test';

export async function signInAs(
  page: Page,
  email: string,
  callbackUrl: string
): Promise<void> {
  await page.goto(
    `/api/auth/dev-login?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`
  );
  await page.waitForURL(url => url.pathname === callbackUrl);
}

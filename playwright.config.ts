import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm run mock-fcc-data',
      url: 'http://localhost:3002/data',
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'pnpm run develop',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000
    }
  ]
});

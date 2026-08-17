import {
  defineConfig,
  devices,
  type PlaywrightTestOptions,
} from '@playwright/test';

const sharedUiUse: Partial<PlaywrightTestOptions> = {
  baseURL: 'https://practicesoftwaretesting.com',
  testIdAttribute: 'data-test',
};

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'UI Chrome',
      use: {
        ...devices['Desktop Chrome'],
        ...sharedUiUse,
      },
      testDir: './tests/ui',
    },
    {
      name: 'UI Firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...sharedUiUse,
      },
      testDir: './tests/ui',
    },
    {
      name: 'UI Safari',
      use: {
        ...devices['Desktop Safari'],
        ...sharedUiUse,
      },
      testDir: './tests/ui',
    },
    {
      name: 'API',
      use: {
        baseURL: 'https://api.practicesoftwaretesting.com',
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
      testDir: './tests/api',
    },
  ],
});

import { existsSync } from 'node:fs';
import {
  defineConfig,
  devices,
  type PlaywrightTestOptions,
} from '@playwright/test';

const sharedUiUse: Partial<PlaywrightTestOptions> = {
  baseURL: 'https://practicesoftwaretesting.com',
  testIdAttribute: 'data-test',
};

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

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
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        baseURL: 'https://api.practicesoftwaretesting.com',
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
    {
      name: 'UI Chrome',
      use: {
        ...devices['Desktop Chrome'],
        ...sharedUiUse,
      },
      testDir: './tests/ui',
      dependencies: ['setup'],
    },
    {
      name: 'UI Firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...sharedUiUse,
      },
      testDir: './tests/ui',
      dependencies: ['setup'],
    },
    {
      name: 'UI Safari',
      use: {
        ...devices['Desktop Safari'],
        ...sharedUiUse,
      },
      testDir: './tests/ui',
      dependencies: ['setup'],
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
      dependencies: ['setup'],
    },
  ],
});

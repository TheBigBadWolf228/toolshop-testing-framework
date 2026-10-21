import { existsSync } from 'node:fs';
import {
  defineConfig,
  devices,
  type PlaywrightTestOptions,
} from '@playwright/test';
import { API_HEADERS, API_URL, UI_URL } from './tests/support/env.js';

const sharedUiUse: Partial<PlaywrightTestOptions> = {
  baseURL: UI_URL,
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
        baseURL: API_URL,
        extraHTTPHeaders: API_HEADERS,
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
        baseURL: API_URL,
        extraHTTPHeaders: API_HEADERS,
      },
      testDir: './tests/api',
      dependencies: ['setup'],
    },
  ],
});

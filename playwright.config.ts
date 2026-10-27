import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
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

const { version: playwrightVersion } = createRequire(import.meta.url)(
  '@playwright/test/package.json'
) as { version: string };

function git(args: string): string {
  return execSync(`git ${args}`, { encoding: 'utf8' }).trim();
}

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  globalTimeout: process.env.CI ? 45 * 60 * 1000 : undefined,
  reporter: [
    ['html'],
    ...(process.env.CI ? [['github'] as const] : []),
    ['./tests/support/summary-reporter.ts'],
    [
      './tests/support/allure-reporter.ts',
      {
        resultsDir: 'allure-results',
        detail: false,
        environmentInfo: {
          'UI URL': UI_URL,
          'API URL': API_URL,
          Run: process.env.CI ? 'CI' : 'local',
          Branch: git('rev-parse --abbrev-ref HEAD'),
          Commit: git('rev-parse --short HEAD'),
          Node: process.version,
          Playwright: playwrightVersion,
        },
      },
    ],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
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

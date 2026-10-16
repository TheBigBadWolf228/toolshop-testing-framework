import {
  test as base,
  type APIRequestContext,
  type PlaywrightWorkerArgs,
} from '@playwright/test';
import { readToken } from '../../support/auth.js';
import type { Role } from '../../support/users.js';
import { createApi, type Api } from '../clients/api.js';
import { Cleanup } from './cleanup.js';

interface ApiFixtures {
  cleanup: Cleanup;
  customerRequest: APIRequestContext;
  adminRequest: APIRequestContext;
  api: Api;
  customerApi: Api;
  anonApi: Api;
}

interface ApiOptions {
  baseURL: string | undefined;
  headers: Record<string, string> | undefined;
}

async function createAuthedContext(
  playwright: PlaywrightWorkerArgs['playwright'],
  { baseURL, headers }: ApiOptions,
  role: Role
): Promise<APIRequestContext> {
  const token = await readToken(role);
  return playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { ...headers, Authorization: `Bearer ${token}` },
  });
}

// Runs cleanup here because request contexts may be disposed in the fixture!
async function provideApi(
  request: APIRequestContext,
  cleanup: Cleanup,
  use: (api: Api) => Promise<void>
): Promise<void> {
  await use(createApi(request, cleanup));
  await cleanup.run();
}

export const test = base.extend<ApiFixtures>({
  customerRequest: async ({ playwright, baseURL, extraHTTPHeaders }, use) => {
    const context = await createAuthedContext(
      playwright,
      { baseURL, headers: extraHTTPHeaders },
      'customer'
    );
    await use(context);
    await context.dispose();
  },
  adminRequest: async ({ playwright, baseURL, extraHTTPHeaders }, use) => {
    const context = await createAuthedContext(
      playwright,
      { baseURL, headers: extraHTTPHeaders },
      'admin'
    );
    await use(context);
    await context.dispose();
  },
  cleanup: async ({}, use) => {
    await use(new Cleanup());
  },
  api: async ({ adminRequest, cleanup }, use) => {
    await provideApi(adminRequest, cleanup, use);
  },
  customerApi: async ({ customerRequest, cleanup }, use) => {
    await provideApi(customerRequest, cleanup, use);
  },
  anonApi: async ({ request, cleanup }, use) => {
    await provideApi(request, cleanup, use);
  },
});

export { expect } from '@playwright/test';

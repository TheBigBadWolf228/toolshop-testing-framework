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
  invalidTokenRequest: APIRequestContext;
  api: Api;
  customerApi: Api;
  anonApi: Api;
  invalidTokenApi: Api;
}

type ApiRole = Role | 'invalidToken';

const INVALID_TOKEN = 'not.a.jwt';

interface ApiOptions {
  baseURL: string | undefined;
  headers: Record<string, string> | undefined;
}

async function createAuthedContext(
  playwright: PlaywrightWorkerArgs['playwright'],
  { baseURL, headers }: ApiOptions,
  role: ApiRole
): Promise<APIRequestContext> {
  const token = role === 'invalidToken' ? INVALID_TOKEN : await readToken(role);
  return playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { ...headers, Authorization: `Bearer ${token}` },
  });
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
  invalidTokenRequest: async (
    { playwright, baseURL, extraHTTPHeaders },
    use
  ) => {
    const context = await createAuthedContext(
      playwright,
      { baseURL, headers: extraHTTPHeaders },
      'invalidToken'
    );
    await use(context);
    await context.dispose();
  },
  cleanup: async ({ adminRequest }, use) => {
    const cleanup = new Cleanup(adminRequest);
    await use(cleanup);
    await cleanup.run();
  },
  api: async ({ adminRequest, cleanup }, use) => {
    await use(createApi(adminRequest, cleanup));
  },
  customerApi: async ({ customerRequest, cleanup }, use) => {
    await use(createApi(customerRequest, cleanup));
  },
  anonApi: async ({ request, cleanup }, use) => {
    await use(createApi(request, cleanup));
  },
  invalidTokenApi: async ({ invalidTokenRequest, cleanup }, use) => {
    await use(createApi(invalidTokenRequest, cleanup));
  },
});

export { expect } from '@playwright/test';

import {
  test as base,
  type APIRequestContext,
  type PlaywrightWorkerArgs,
} from '@playwright/test';
import { readToken } from '../../support/auth.js';
import type { Role } from '../../support/users.js';
import { createApi, type Api } from '../clients/api.js';

interface ApiFixtures {
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

async function provideApi(
  request: APIRequestContext,
  use: (api: Api) => Promise<void>
): Promise<void> {
  const api = createApi(request);
  await use(api);
  await api.brands.deleteCreated();
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
  api: async ({ adminRequest }, use) => {
    await provideApi(adminRequest, use);
  },
  customerApi: async ({ customerRequest }, use) => {
    await provideApi(customerRequest, use);
  },
  anonApi: async ({ request }, use) => {
    await provideApi(request, use);
  },
});

export { expect } from '@playwright/test';

import {
  test as base,
  type APIRequestContext,
  type PlaywrightWorkerArgs,
} from '@playwright/test';
import { readToken } from '../../support/auth.js';
import { API_HEADERS, API_URL } from '../../support/env.js';
import type { ApiCaller } from '../../support/users.js';
import { createApi, type Api } from '../clients/api.js';
import { INVALID_TOKEN } from '../data/access.js';
import { Cleanup } from './cleanup.js';

export interface ApiFixtures {
  cleanup: Cleanup;
  customerRequest: APIRequestContext;
  adminRequest: APIRequestContext;
  anonRequest: APIRequestContext;
  invalidTokenRequest: APIRequestContext;
  api: Api;
  customerApi: Api;
  anonApi: Api;
  invalidTokenApi: Api;
  apiAs: (caller: ApiCaller) => Api;
}

async function authHeader(caller: ApiCaller): Promise<Record<string, string>> {
  if (caller === 'anon') {
    return {};
  }
  const token =
    caller === 'invalidToken' ? INVALID_TOKEN : await readToken(caller);
  return { Authorization: `Bearer ${token}` };
}

async function createApiContext(
  playwright: PlaywrightWorkerArgs['playwright'],
  caller: ApiCaller
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { ...API_HEADERS, ...(await authHeader(caller)) },
  });
}

export const test = base.extend<ApiFixtures>({
  customerRequest: async ({ playwright }, use) => {
    const context = await createApiContext(playwright, 'customer');
    await use(context);
    await context.dispose();
  },
  adminRequest: async ({ playwright }, use) => {
    const context = await createApiContext(playwright, 'admin');
    await use(context);
    await context.dispose();
  },
  anonRequest: async ({ playwright }, use) => {
    const context = await createApiContext(playwright, 'anon');
    await use(context);
    await context.dispose();
  },
  invalidTokenRequest: async ({ playwright }, use) => {
    const context = await createApiContext(playwright, 'invalidToken');
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
  anonApi: async ({ anonRequest, cleanup }, use) => {
    await use(createApi(anonRequest, cleanup));
  },
  invalidTokenApi: async ({ invalidTokenRequest, cleanup }, use) => {
    await use(createApi(invalidTokenRequest, cleanup));
  },
  apiAs: async ({ api, customerApi, anonApi, invalidTokenApi }, use) => {
    const apis: Record<ApiCaller, Api> = {
      admin: api,
      customer: customerApi,
      anon: anonApi,
      invalidToken: invalidTokenApi,
    };
    await use((caller) => apis[caller]);
  },
});

export { expect } from '@playwright/test';

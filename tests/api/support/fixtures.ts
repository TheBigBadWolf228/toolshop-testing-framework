import {
  test as base,
  type APIRequestContext,
  type PlaywrightWorkerArgs,
} from '@playwright/test';
import { API_HEADERS, API_URL } from '../../support/env.js';
import type { ApiCaller } from '../../support/users.js';
import { createApi, type Api } from '../clients/api.js';
import { INVALID_TOKEN } from '../data/access.js';
import { Cleanup } from './cleanup.js';
import { Tokens } from './tokens.js';

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

export interface ApiWorkerFixtures {
  tokens: Tokens;
}

type Playwright = PlaywrightWorkerArgs['playwright'];

export function newApiContext(
  playwright: Playwright,
  headers: Record<string, string> = {}
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { ...API_HEADERS, ...headers },
  });
}

async function authHeader(
  tokens: Tokens,
  caller: ApiCaller
): Promise<Record<string, string>> {
  if (caller === 'anon') {
    return {};
  }
  const token =
    caller === 'invalidToken' ? INVALID_TOKEN : await tokens.get(caller);
  return { Authorization: `Bearer ${token}` };
}

async function createApiContext(
  playwright: Playwright,
  tokens: Tokens,
  caller: ApiCaller
): Promise<APIRequestContext> {
  return newApiContext(playwright, await authHeader(tokens, caller));
}

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  tokens: [
    async ({ playwright }, use) => {
      const context = await newApiContext(playwright);
      await use(new Tokens(context));
      await context.dispose();
    },
    { scope: 'worker' },
  ],
  customerRequest: async ({ playwright, tokens }, use) => {
    const context = await createApiContext(playwright, tokens, 'customer');
    await use(context);
    await context.dispose();
  },
  adminRequest: async ({ playwright, tokens }, use) => {
    const context = await createApiContext(playwright, tokens, 'admin');
    await use(context);
    await context.dispose();
  },
  anonRequest: async ({ playwright, tokens }, use) => {
    const context = await createApiContext(playwright, tokens, 'anon');
    await use(context);
    await context.dispose();
  },
  invalidTokenRequest: async ({ playwright, tokens }, use) => {
    const context = await createApiContext(playwright, tokens, 'invalidToken');
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

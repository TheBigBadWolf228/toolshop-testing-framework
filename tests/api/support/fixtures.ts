import {
  test as base,
  type APIRequestContext,
  type PlaywrightWorkerArgs,
} from '@playwright/test';
import { readToken } from '../../support/auth.js';
import type { Role } from '../../support/users.js';
import { BrandsClient } from '../clients/brands.client.js';

interface Api {
  brands: BrandsClient;
}

interface ApiFixtures {
  customerRequest: APIRequestContext;
  adminRequest: APIRequestContext;
  api: Api;
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
    const api: Api = { brands: new BrandsClient(adminRequest) };
    await use(api);
    await api.brands.deleteCreated();
  },
});

export { expect } from '@playwright/test';

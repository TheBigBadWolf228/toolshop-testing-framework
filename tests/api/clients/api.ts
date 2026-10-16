import type { APIRequestContext } from '@playwright/test';
import type { Cleanup } from '../support/cleanup.js';
import { BrandsClient } from './brands.client.js';

export interface Api {
  brands: BrandsClient;
}

export function createApi(request: APIRequestContext, cleanup: Cleanup): Api {
  return { brands: new BrandsClient(request, cleanup) };
}

import type { APIRequestContext } from '@playwright/test';
import { BrandsClient } from './brands.client.js';

export interface Api {
  brands: BrandsClient;
}

export function createApi(request: APIRequestContext): Api {
  return { brands: new BrandsClient(request) };
}

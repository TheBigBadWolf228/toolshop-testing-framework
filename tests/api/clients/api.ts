import type { APIRequestContext } from '@playwright/test';
import type { Cleanup } from '../support/cleanup.js';
import { BrandsClient } from './brands.client.js';
import { CategoriesClient } from './categories.client.js';

export interface Api {
  brands: BrandsClient;
  categories: CategoriesClient;
}

export function createApi(request: APIRequestContext, cleanup: Cleanup): Api {
  return {
    brands: new BrandsClient(request, cleanup),
    categories: new CategoriesClient(request, cleanup),
  };
}

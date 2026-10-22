import type { APIRequestContext } from '@playwright/test';
import type { Cleanup } from '../support/cleanup.js';
import { BrandsClient } from './brands.client.js';
import { CategoriesClient } from './categories.client.js';
import { ImagesClient } from './images.client.js';
import { ProductsClient } from './products.client.js';
import { UsersClient } from './users.client.js';

export interface Api {
  brands: BrandsClient;
  categories: CategoriesClient;
  images: ImagesClient;
  products: ProductsClient;
  users: UsersClient;
}

export function createApi(request: APIRequestContext, cleanup: Cleanup): Api {
  return {
    brands: new BrandsClient(request, cleanup),
    categories: new CategoriesClient(request, cleanup),
    images: new ImagesClient(request),
    products: new ProductsClient(request, cleanup),
    users: new UsersClient(request),
  };
}

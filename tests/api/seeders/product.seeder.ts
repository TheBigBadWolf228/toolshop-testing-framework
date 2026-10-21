import { faker } from '@faker-js/faker';
import type { Api } from '../clients/api.js';
import { SEEDED_PRODUCT_STOCK } from '../data/products.js';
import { buildBrand } from '../factories/brand.factory.js';
import { buildCategory } from '../factories/category.factory.js';
import { buildProduct } from '../factories/product.factory.js';
import type {
  CreatedProduct,
  ProductRequest,
} from '../schemas/product.schema.js';

export async function seedProduct(
  api: Api,
  overrides: Partial<ProductRequest> = {}
): Promise<CreatedProduct> {
  const refs = {
    brand_id: overrides.brand_id ?? (await api.brands.create(buildBrand())).id,
    category_id:
      overrides.category_id ??
      (await api.categories.create(buildCategory())).id,
    product_image_id:
      overrides.product_image_id ??
      faker.helpers.arrayElement(await api.images.list()).id,
  };
  return api.products.create(
    buildProduct(refs, { stock: SEEDED_PRODUCT_STOCK, ...overrides })
  );
}

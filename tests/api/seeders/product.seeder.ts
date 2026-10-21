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
  const brand = await api.brands.create(buildBrand());
  const category = await api.categories.create(buildCategory());
  const image = faker.helpers.arrayElement(await api.images.list());
  return api.products.create(
    buildProduct(
      {
        brand_id: brand.id,
        category_id: category.id,
        product_image_id: image.id,
      },
      { stock: SEEDED_PRODUCT_STOCK, ...overrides }
    )
  );
}

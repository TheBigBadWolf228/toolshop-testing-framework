import { faker } from '@faker-js/faker';
import type { Api } from '../clients/api.js';
import { SEEDED_PRODUCT_STOCK } from '../data/products.js';
import { buildBrand } from '../factories/brand.factory.js';
import { buildCategory } from '../factories/category.factory.js';
import { buildProduct } from '../factories/product.factory.js';
import type {
  CreatedProduct,
  Product,
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

export async function restockProduct(
  api: Api,
  name: string,
  stock: number
): Promise<Product> {
  const { data } = await api.products.search(name);
  const match = data.find((product) => product.name === name);
  if (!match) {
    throw new Error(`Product "${name}" not found by search.`);
  }
  await api.products.setStock(match.id, stock);
  const product = await api.products.get(match.id);
  // Others keep buying it, so expecting most of the stock, not exact number.
  if (typeof product.in_stock !== 'number' || product.in_stock < stock / 2) {
    throw new Error(
      `Restock of "${name}" to ${stock} was ignored: in_stock is ${product.in_stock}.`
    );
  }
  return product;
}

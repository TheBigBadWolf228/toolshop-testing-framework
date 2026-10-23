import { faker } from '@faker-js/faker';
import { SEED_PRODUCT_REFS } from '../data/admin.js';
import type { AdminProductForm } from '../pages/admin-product-form.page.js';

export function buildAdminProduct(
  overrides: Partial<AdminProductForm> = {}
): AdminProductForm {
  return {
    name: `autotest ${faker.commerce.productName()} ${faker.string.alphanumeric(6)}`,
    description: faker.commerce.productDescription(),
    stock: faker.number.int({ min: 1, max: 100 }),
    price: faker.commerce.price({ min: 1, max: 500 }),
    ...SEED_PRODUCT_REFS,
    ...overrides,
  };
}

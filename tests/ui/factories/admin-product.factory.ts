import { faker } from '@faker-js/faker';
import { SEED_PRODUCT_REFS } from '../data/admin.js';
import type { AdminProductForm } from '../pages/admin-product-form.page.js';

function buildPrice(): string {
  const units = faker.number.int({ min: 1, max: 499 });
  const tens = faker.string.numeric(1);
  const cents = faker.string.numeric({ length: 1, exclude: ['0'] });
  return `${units}.${tens}${cents}`;
}

export function buildAdminProduct(
  overrides: Partial<AdminProductForm> = {}
): AdminProductForm {
  return {
    name: `autotest ${faker.commerce.productName()} ${faker.string.alphanumeric(6)}`,
    description: faker.commerce.productDescription(),
    stock: faker.number.int({ min: 1, max: 100 }),
    price: buildPrice(),
    ...SEED_PRODUCT_REFS,
    ...overrides,
  };
}

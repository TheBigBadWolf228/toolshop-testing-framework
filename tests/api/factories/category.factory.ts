import { faker } from '@faker-js/faker';
import type { CategoryRequest } from '../schemas/category.schema.js';

export function buildCategory(
  overrides: Partial<CategoryRequest> = {}
): CategoryRequest {
  const name = `autotest ${faker.commerce.department()} ${faker.string.alphanumeric(6)}`;
  return {
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    ...overrides,
  };
}

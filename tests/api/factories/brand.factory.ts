import { faker } from '@faker-js/faker';
import type { BrandRequest } from '../schemas/brand.schema.js';

export function buildBrand(
  overrides: Partial<BrandRequest> = {}
): BrandRequest {
  const name = `autotest ${faker.company.name()} ${faker.string.alphanumeric(6)}`;
  return {
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    ...overrides,
  };
}

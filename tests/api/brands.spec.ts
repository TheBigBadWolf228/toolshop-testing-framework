import { faker } from '@faker-js/faker';
import { test, expect } from './support/fixtures.js';

test.describe('brands CRUD', () => {
  test('should create a brand when valid data is sent', async ({ api }) => {
    const slug = `autotest-${faker.string.alphanumeric(8).toLowerCase()}`;
    const data = { name: slug, slug };

    const brand = await api.brands.create(data);

    expect(brand).toMatchObject(data);
    expect(brand.id).toBeTruthy();
  });
});

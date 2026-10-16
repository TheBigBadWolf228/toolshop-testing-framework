import { test, expect } from './support/fixtures.js';
import { buildCategory } from './factories/category.factory.js';

test.describe('categories CRUD', () => {
  test('should create a category when valid data is sent', async ({ api }) => {
    const data = buildCategory();

    const category = await api.categories.create(data);

    expect(category).toMatchObject(data);
    expect(category.id).toBeTruthy();
  });
});

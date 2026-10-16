import { test, expect } from './support/fixtures.js';
import { buildBrand } from './factories/brand.factory.js';
import { ValidationErrorsSchema } from './schemas/responses.schema.js';

test.describe('brands CRUD', () => {
  test('should create a brand when valid data is sent', async ({ api }) => {
    const data = buildBrand();

    const brand = await api.brands.create(data);

    expect(brand).toMatchObject(data);
    expect(brand.id).toBeTruthy();
  });

  test('should return the brand when it is requested by id', async ({
    api,
  }) => {
    const created = await api.brands.create(buildBrand());

    const brand = await api.brands.get(created.id);

    expect(brand).toEqual(created);
  });

  test('should include the brand in the list when it exists', async ({
    api,
  }) => {
    const created = await api.brands.create(buildBrand());

    const brands = await api.brands.list();

    expect(brands).toContainEqual(created);
  });

  test('should replace name and slug when brand is updated with PUT', async ({
    api,
  }) => {
    const created = await api.brands.create(buildBrand());
    const update = buildBrand();

    await api.brands.update(created.id, update);

    expect(await api.brands.get(created.id)).toEqual({
      id: created.id,
      ...update,
    });
  });

  test('should change only the sent field when brand is updated with PATCH', async ({
    api,
  }) => {
    const created = await api.brands.create(buildBrand());
    const { name } = buildBrand();

    await api.brands.patch(created.id, { name });

    expect(await api.brands.get(created.id)).toEqual({ ...created, name });
  });

  test('should remove the brand when it is deleted', async ({ api }) => {
    const created = await api.brands.create(buildBrand());

    await api.brands.delete(created.id);

    const response = await api.brands.getRaw(created.id);
    expect(response.status()).toBe(404);
  });
});

test.describe('brands rules', () => {
  test('should reject the brand when the slug already exists', async ({
    api,
  }) => {
    const existing = await api.brands.create(buildBrand());

    const response = await api.brands.createRaw(
      buildBrand({ slug: existing.slug })
    );

    expect(response.status()).toBe(409);
    const errors = ValidationErrorsSchema.parse(await response.json());
    expect(errors).toHaveProperty('slug');
  });

  test('should report every missing field when body is empty', async ({
    api,
  }) => {
    const response = await api.brands.createRaw({});

    expect(response.status()).toBe(422);
    const errors = ValidationErrorsSchema.parse(await response.json());
    expect(Object.keys(errors).sort()).toEqual(['name', 'slug']);
  });

  test('should not delete the brand when no token is sent', async ({
    api,
    anonApi,
  }) => {
    const created = await api.brands.create(buildBrand());

    const response = await anonApi.brands.deleteRaw(created.id);

    expect(response.status()).toBe(401);
  });

  test('should not delete the brand when the user is a customer', async ({
    api,
    customerApi,
  }) => {
    const created = await api.brands.create(buildBrand());

    const response = await customerApi.brands.deleteRaw(created.id);

    expect(response.status()).toBe(403);
  });
});

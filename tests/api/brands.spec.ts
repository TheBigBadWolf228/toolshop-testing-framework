import type { APIResponse } from '@playwright/test';
import { test, expect } from './support/fixtures.js';
import type { Api } from './clients/api.js';
import {
  METHOD_NOT_ALLOWED,
  NON_ADMIN_CALLERS,
  NOT_FOUND,
  UNKNOWN_ID,
  WRONG_METHODS,
} from './data/access.js';
import { BRAND_REQUIRED_FIELDS } from './data/brands.js';
import { buildBrand } from './factories/brand.factory.js';
import { ValidationErrorsSchema } from './schemas/responses.schema.js';
import { expectDenied } from './support/expect-denied.js';
import { expectSchema } from './support/expect-schema.js';

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
    const errors = expectSchema(
      ValidationErrorsSchema,
      await response.json(),
      'POST /brands 409'
    );
    expect(errors).toHaveProperty('slug');
  });

  test('should report every missing field when body is empty', async ({
    api,
  }) => {
    const response = await api.brands.createRaw({});

    expect(response.status()).toBe(422);
    const errors = expectSchema(
      ValidationErrorsSchema,
      await response.json(),
      'POST /brands 422'
    );
    expect(Object.keys(errors).sort()).toEqual(
      [...BRAND_REQUIRED_FIELDS].sort()
    );
  });

  for (const { caller, ...denial } of NON_ADMIN_CALLERS) {
    test(`should not delete the brand as ${caller}`, async ({ api, apiAs }) => {
      const created = await api.brands.create(buildBrand());

      const response = await apiAs(caller).brands.deleteRaw(created.id);

      await expectDenied(response, denial, 'DELETE /brands');
      expect((await api.brands.getRaw(created.id)).status()).toBe(200);
    });
  }
});

test.describe('brands not found and wrong method', () => {
  const unknownIdCalls: Record<string, (api: Api) => Promise<APIResponse>> = {
    GET: (api) => api.brands.getRaw(UNKNOWN_ID),
    PUT: (api) => api.brands.updateRaw(UNKNOWN_ID, buildBrand()),
    PATCH: (api) =>
      api.brands.patchRaw(UNKNOWN_ID, { name: buildBrand().name }),
    DELETE: (api) => api.brands.deleteRaw(UNKNOWN_ID),
  };

  for (const [method, call] of Object.entries(unknownIdCalls)) {
    test(`should return 404 when ${method} targets an unknown brand`, async ({
      api,
    }) => {
      await expectDenied(await call(api), NOT_FOUND, `${method} /brands/{id}`);
    });
  }

  for (const method of WRONG_METHODS.collection) {
    test(`should return 405 when ${method} is sent to the brand list`, async ({
      adminRequest,
    }) => {
      const response = await adminRequest.fetch('/brands', { method });

      await expectDenied(response, METHOD_NOT_ALLOWED, `${method} /brands`);
    });
  }

  for (const method of WRONG_METHODS.item) {
    test(`should return 405 when ${method} is sent to a single brand`, async ({
      adminRequest,
    }) => {
      const response = await adminRequest.fetch(`/brands/${UNKNOWN_ID}`, {
        method,
      });

      await expectDenied(
        response,
        METHOD_NOT_ALLOWED,
        `${method} /brands/{id}`
      );
    });
  }
});

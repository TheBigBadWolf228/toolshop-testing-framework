import type { APIResponse } from '@playwright/test';
import { test, expect } from './support/fixtures.js';
import type { Api } from './clients/api.js';
import {
  METHOD_NOT_ALLOWED,
  NOT_FOUND,
  UNKNOWN_ID,
  WRONG_METHODS,
} from './data/access.js';
import { buildCategory } from './factories/category.factory.js';
import type { Category, CategoryRequest } from './schemas/category.schema.js';
import { expectDenied } from './support/expect-denied.js';

function topLevelCategory(id: string, data: CategoryRequest): Category {
  return { id, ...data, parent_id: null, sub_categories: [] };
}

test.describe('categories CRUD', () => {
  test(
    'should create a category when valid data is sent',
    { tag: '@smoke' },
    async ({ api }) => {
      const data = buildCategory();

      const category = await api.categories.create(data);

      expect(category).toMatchObject(data);
      expect(category.id).toBeTruthy();
    }
  );

  test('should return the category when it is requested by id', async ({
    api,
  }) => {
    const data = buildCategory();
    const created = await api.categories.create(data);

    const category = await api.categories.get(created.id);

    expect(category).toEqual(topLevelCategory(created.id, data));
  });

  test('should include the category in the list when it exists', async ({
    api,
  }) => {
    const data = buildCategory();
    const created = await api.categories.create(data);

    const categories = await api.categories.list();

    expect(categories).toContainEqual({
      id: created.id,
      ...data,
      parent_id: null,
    });
  });

  test('should replace name and slug when category is updated with PUT', async ({
    api,
  }) => {
    const created = await api.categories.create(buildCategory());
    const update = buildCategory();

    await api.categories.update(created.id, update);

    expect(await api.categories.get(created.id)).toEqual(
      topLevelCategory(created.id, update)
    );
  });

  test('should change only the sent field when category is updated with PATCH', async ({
    api,
  }) => {
    const data = buildCategory();
    const created = await api.categories.create(data);
    const { name } = buildCategory();

    await api.categories.patch(created.id, { name });

    expect(await api.categories.get(created.id)).toEqual(
      topLevelCategory(created.id, { ...data, name })
    );
  });

  test('should remove the category when it is deleted', async ({ api }) => {
    const created = await api.categories.create(buildCategory());

    await api.categories.delete(created.id);

    const response = await api.categories.getRaw(created.id);
    expect(response.status()).toBe(404);
  });
});

test.describe('categories not found and wrong method', () => {
  const unknownIdCalls: Record<string, (api: Api) => Promise<APIResponse>> = {
    GET: (api) => api.categories.getRaw(UNKNOWN_ID),
    PUT: (api) => api.categories.updateRaw(UNKNOWN_ID, buildCategory()),
    PATCH: (api) =>
      api.categories.patchRaw(UNKNOWN_ID, { name: buildCategory().name }),
    DELETE: (api) => api.categories.deleteRaw(UNKNOWN_ID),
  };

  for (const [method, call] of Object.entries(unknownIdCalls)) {
    test(`should return 404 when ${method} targets an unknown category`, async ({
      api,
    }) => {
      await expectDenied(
        await call(api),
        NOT_FOUND,
        `${method} /categories/{id}`
      );
    });
  }

  for (const method of WRONG_METHODS.collection) {
    test(`should return 405 when ${method} is sent to the category list`, async ({
      adminRequest,
    }) => {
      const response = await adminRequest.fetch('/categories', { method });

      await expectDenied(response, METHOD_NOT_ALLOWED, `${method} /categories`);
    });
  }

  for (const method of WRONG_METHODS.item) {
    test(`should return 405 when ${method} is sent to a single category`, async ({
      adminRequest,
    }) => {
      const response = await adminRequest.fetch(`/categories/${UNKNOWN_ID}`, {
        method,
      });

      await expectDenied(
        response,
        METHOD_NOT_ALLOWED,
        `${method} /categories/{id}`
      );
    });
  }
});

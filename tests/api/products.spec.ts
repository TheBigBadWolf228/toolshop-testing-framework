import { faker } from '@faker-js/faker';
import type { APIResponse } from '@playwright/test';
import { test, expect } from './support/fixtures.js';
import type { Api } from './clients/api.js';
import { buildBrand } from './factories/brand.factory.js';
import { buildCategory } from './factories/category.factory.js';
import { buildProduct, type ProductRefs } from './factories/product.factory.js';
import type { Brand } from './schemas/brand.schema.js';
import type { CreatedCategory } from './schemas/category.schema.js';
import type { Image } from './schemas/image.schema.js';
import type {
  CreatedProduct,
  Product,
  ProductListItem,
  ProductRequest,
} from './schemas/product.schema.js';
import {
  METHOD_NOT_ALLOWED,
  NON_ADMIN_CALLERS,
  NOT_FOUND,
  UNKNOWN_ID,
  WRONG_METHODS,
} from './data/access.js';
import {
  PRODUCT_PUT_EMPTY_BODY,
  PRODUCT_SERVER_ERROR_ON_INVALID_INPUT,
  PRODUCT_WRITE_WITHOUT_AUTH,
} from './data/known-bugs.js';
import {
  ECO_FRIENDLY_RATINGS,
  INVALID_PRODUCT_FIELDS,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_PRICE_TOO_LARGE,
  PRODUCT_RELATION_FIELDS,
  PRODUCT_REQUIRED_FIELDS,
} from './data/products.js';
import { ValidationErrorsSchema } from './schemas/responses.schema.js';
import { expectDenied } from './support/expect-denied.js';
import { expectSchema } from './support/expect-schema.js';

interface ProductDeps {
  brand: Brand;
  category: CreatedCategory;
  image: Image;
}

async function createDeps(api: Api): Promise<ProductDeps> {
  return {
    brand: await api.brands.create(buildBrand()),
    category: await api.categories.create(buildCategory()),
    image: faker.helpers.arrayElement(await api.images.list()),
  };
}

function refsOf({ brand, category, image }: ProductDeps): ProductRefs {
  return {
    brand_id: brand.id,
    category_id: category.id,
    product_image_id: image.id,
  };
}

function invalidProduct(
  refs: ProductRefs,
  override: Record<string, unknown>
): ProductRequest {
  return { ...buildProduct(refs), ...override } as ProductRequest;
}

function baseFields(id: string, data: ProductRequest, image: Image) {
  const { brand_id, category_id, product_image_id, ...fields } = data;
  return {
    id,
    ...fields,
    in_stock: null,
    is_eco_friendly: ECO_FRIENDLY_RATINGS.includes(data.co2_rating),
    product_image: image,
  };
}

function createdProduct(
  id: string,
  data: ProductRequest,
  { brand, category, image }: ProductDeps
): CreatedProduct {
  return {
    ...baseFields(id, data, image),
    brand,
    category: { ...category, parent_id: null },
  };
}

function productDetail(
  id: string,
  data: ProductRequest,
  { brand, category, image }: ProductDeps
): Product {
  return {
    ...baseFields(id, data, image),
    brand: { id: brand.id, name: brand.name },
    category: { ...category, parent_id: null },
    specs: [],
  };
}

function productListItem(
  id: string,
  data: ProductRequest,
  { brand, category, image }: ProductDeps
): ProductListItem {
  return {
    ...baseFields(id, data, image),
    brand: { id: brand.id, name: brand.name },
    category: { id: category.id, name: category.name, slug: category.slug },
  };
}

test.describe('products CRUD', () => {
  test(
    'should create a product when valid data with existing relations is sent',
    { tag: '@smoke' },
    async ({ api }) => {
      const deps = await createDeps(api);
      const data = buildProduct(refsOf(deps));

      const product = await api.products.create(data);

      expect(product).toEqual(createdProduct(product.id, data, deps));
    }
  );

  test(
    'should return the product when it is requested by id',
    { tag: '@smoke' },
    async ({ api }) => {
      const deps = await createDeps(api);
      const data = buildProduct(refsOf(deps));
      const created = await api.products.create(data);

      const product = await api.products.get(created.id);

      expect(product).toEqual(productDetail(created.id, data, deps));
    }
  );

  test('should list only the product when filtered by its category', async ({
    api,
  }) => {
    const deps = await createDeps(api);
    const data = buildProduct(refsOf(deps));
    const created = await api.products.create(data);

    const page = await api.products.list({ by_category: deps.category.id });

    expect(page.data).toEqual([productListItem(created.id, data, deps)]);
    expect(page.total).toBe(1);
  });

  test('should replace fields and relations when product is updated with PUT', async ({
    api,
  }) => {
    const deps = await createDeps(api);
    const newDeps = await createDeps(api);
    const created = await api.products.create(buildProduct(refsOf(deps)));
    const update = buildProduct(refsOf(newDeps));

    await api.products.update(created.id, update);

    expect(await api.products.get(created.id)).toEqual(
      productDetail(created.id, update, newDeps)
    );
  });

  test('should change only the sent field when product is updated with PATCH', async ({
    api,
  }) => {
    const deps = await createDeps(api);
    const data = buildProduct(refsOf(deps));
    const created = await api.products.create(data);
    const { price } = buildProduct(refsOf(deps));

    await api.products.patch(created.id, { price });

    expect(await api.products.get(created.id)).toEqual(
      productDetail(created.id, { ...data, price }, deps)
    );
  });

  test('should remove the product when it is deleted', async ({ api }) => {
    const deps = await createDeps(api);
    const created = await api.products.create(buildProduct(refsOf(deps)));

    await api.products.delete(created.id);

    const response = await api.products.getRaw(created.id);
    expect(response.status()).toBe(404);
  });
});

test.describe('products access control', () => {
  for (const { caller, ...denial } of NON_ADMIN_CALLERS) {
    test(`should not delete the product as ${caller}`, async ({
      api,
      apiAs,
    }) => {
      const deps = await createDeps(api);
      const created = await api.products.create(buildProduct(refsOf(deps)));

      const response = await apiAs(caller).products.deleteRaw(created.id);

      await expectDenied(response, denial, 'DELETE /products');
      expect((await api.products.getRaw(created.id)).status()).toBe(200);
    });

    test.fail(
      `should not create a product as ${caller}`,
      PRODUCT_WRITE_WITHOUT_AUTH,
      async ({ api, apiAs }) => {
        const deps = await createDeps(api);

        const response = await apiAs(caller).products.createRaw(
          buildProduct(refsOf(deps))
        );

        await expectDenied(response, denial, 'POST /products');
        const page = await api.products.list({ by_category: deps.category.id });
        expect(page.total).toBe(0);
      }
    );

    test.fail(
      `should not replace the product as ${caller}`,
      PRODUCT_WRITE_WITHOUT_AUTH,
      async ({ api, apiAs }) => {
        const deps = await createDeps(api);
        const data = buildProduct(refsOf(deps));
        const created = await api.products.create(data);

        const response = await apiAs(caller).products.updateRaw(
          created.id,
          buildProduct(refsOf(deps))
        );

        await expectDenied(response, denial, 'PUT /products');
        expect(await api.products.get(created.id)).toEqual(
          productDetail(created.id, data, deps)
        );
      }
    );

    test.fail(
      `should not patch the product as ${caller}`,
      PRODUCT_WRITE_WITHOUT_AUTH,
      async ({ api, apiAs }) => {
        const deps = await createDeps(api);
        const data = buildProduct(refsOf(deps));
        const created = await api.products.create(data);
        const { price } = buildProduct(refsOf(deps));

        const response = await apiAs(caller).products.patchRaw(created.id, {
          price,
        });

        await expectDenied(response, denial, 'PATCH /products');
        expect(await api.products.get(created.id)).toEqual(
          productDetail(created.id, data, deps)
        );
      }
    );
  }
});

test.describe('products rules', () => {
  test('should report every missing field when body is empty', async ({
    api,
  }) => {
    const response = await api.products.createRaw({});

    expect(response.status()).toBe(422);
    const errors = expectSchema(
      ValidationErrorsSchema,
      await response.json(),
      'POST /products 422'
    );
    expect(Object.keys(errors).sort()).toEqual(
      [...PRODUCT_REQUIRED_FIELDS].sort()
    );
  });

  for (const { label, override, field, message } of INVALID_PRODUCT_FIELDS) {
    test(`should reject the product when ${label}`, async ({ api }) => {
      const deps = await createDeps(api);

      const response = await api.products.createRaw(
        invalidProduct(refsOf(deps), override)
      );

      expect(response.status()).toBe(422);
      const errors = expectSchema(
        ValidationErrorsSchema,
        await response.json(),
        'POST /products 422'
      );
      expect(errors).toEqual({ [field]: [message] });
      const page = await api.products.list({ by_category: deps.category.id });
      expect(page.total).toBe(0);
    });
  }

  test('should create the product when name is exactly at the length limit', async ({
    api,
  }) => {
    const deps = await createDeps(api);
    const data = buildProduct(refsOf(deps), {
      name: 'n'.repeat(PRODUCT_NAME_MAX_LENGTH),
    });

    const product = await api.products.create(data);

    expect(product).toEqual(createdProduct(product.id, data, deps));
  });

  for (const field of PRODUCT_RELATION_FIELDS) {
    test.fail(
      `should reject the product when ${field} does not exist`,
      PRODUCT_SERVER_ERROR_ON_INVALID_INPUT,
      async ({ api }) => {
        const deps = await createDeps(api);

        const response = await api.products.createRaw(
          buildProduct(refsOf(deps), { [field]: UNKNOWN_ID })
        );

        expect(response.status()).toBe(422);
        const errors = expectSchema(
          ValidationErrorsSchema,
          await response.json(),
          'POST /products 422'
        );
        expect(errors).toHaveProperty(field);
      }
    );
  }

  test.fail(
    'should reject the product when price is too large',
    PRODUCT_SERVER_ERROR_ON_INVALID_INPUT,
    async ({ api }) => {
      const deps = await createDeps(api);

      const response = await api.products.createRaw(
        buildProduct(refsOf(deps), { price: PRODUCT_PRICE_TOO_LARGE })
      );

      expect(response.status()).toBe(422);
      const errors = expectSchema(
        ValidationErrorsSchema,
        await response.json(),
        'POST /products 422'
      );
      expect(errors).toHaveProperty('price');
    }
  );

  test.fail(
    'should reject the update when PUT body is empty',
    PRODUCT_PUT_EMPTY_BODY,
    async ({ api }) => {
      const deps = await createDeps(api);
      const data = buildProduct(refsOf(deps));
      const created = await api.products.create(data);

      const response = await api.products.updateRaw(created.id, {});

      expect(response.status()).toBe(422);
      expectSchema(
        ValidationErrorsSchema,
        await response.json(),
        'PUT /products 422'
      );
      expect(await api.products.get(created.id)).toEqual(
        productDetail(created.id, data, deps)
      );
    }
  );
});

test.describe('products not found and wrong method', () => {
  const unknownIdCalls: Record<string, (api: Api) => Promise<APIResponse>> = {
    GET: (api) => api.products.getRaw(UNKNOWN_ID),
    PUT: (api) => api.products.updateRaw(UNKNOWN_ID, {}),
    PATCH: (api) => api.products.patchRaw(UNKNOWN_ID, {}),
    DELETE: (api) => api.products.deleteRaw(UNKNOWN_ID),
  };

  for (const [method, call] of Object.entries(unknownIdCalls)) {
    test(`should return 404 when ${method} targets an unknown product`, async ({
      api,
    }) => {
      await expectDenied(
        await call(api),
        NOT_FOUND,
        `${method} /products/{id}`
      );
    });
  }

  for (const method of WRONG_METHODS.collection) {
    test(`should return 405 when ${method} is sent to the product list`, async ({
      adminRequest,
    }) => {
      const response = await adminRequest.fetch('/products', { method });

      await expectDenied(response, METHOD_NOT_ALLOWED, `${method} /products`);
    });
  }

  for (const method of WRONG_METHODS.item) {
    test(`should return 405 when ${method} is sent to a single product`, async ({
      adminRequest,
    }) => {
      const response = await adminRequest.fetch(`/products/${UNKNOWN_ID}`, {
        method,
      });

      await expectDenied(
        response,
        METHOD_NOT_ALLOWED,
        `${method} /products/{id}`
      );
    });
  }
});

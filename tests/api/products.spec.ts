import { faker } from '@faker-js/faker';
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
import { NON_ADMIN_CALLERS } from './data/access.js';
import { PRODUCT_WRITE_WITHOUT_AUTH } from './data/known-bugs.js';
import { ECO_FRIENDLY_RATINGS } from './data/products.js';
import { expectDenied } from './support/expect-denied.js';

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
  test('should create a product when valid data with existing relations is sent', async ({
    api,
  }) => {
    const deps = await createDeps(api);
    const data = buildProduct(refsOf(deps));

    const product = await api.products.create(data);

    expect(product).toEqual(createdProduct(product.id, data, deps));
  });

  test('should return the product when it is requested by id', async ({
    api,
  }) => {
    const deps = await createDeps(api);
    const data = buildProduct(refsOf(deps));
    const created = await api.products.create(data);

    const product = await api.products.get(created.id);

    expect(product).toEqual(productDetail(created.id, data, deps));
  });

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

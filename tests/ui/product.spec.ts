import { test, expect } from './support/fixtures.js';
import { PRODUCT_DETAILS } from './data/shop.js';
import { ProductPage } from './pages/product.page.js';

test(
  'should show the details of the product opened from the list',
  { tag: '@smoke' },
  async ({ page, homePage, productPage }) => {
    await homePage.open();
    await homePage.search(PRODUCT_DETAILS.name);
    await homePage.grid.openProduct(PRODUCT_DETAILS.name);

    await expect(page).toHaveURL(ProductPage.path);
    await expect(productPage.name).toHaveText(PRODUCT_DETAILS.name);
    await expect(productPage.price).toHaveText(PRODUCT_DETAILS.price);
    await expect(productPage.description).toContainText(
      PRODUCT_DETAILS.descriptionStart
    );
  }
);

test('should show the other products of the category as related', async ({
  seedProduct,
  productPage,
}) => {
  const main = await seedProduct();
  const sameCategory = { category_id: main.category.id };
  const first = await seedProduct(sameCategory);
  const second = await seedProduct(sameCategory);

  await productPage.open(main.id);

  await expect(productPage.name).toHaveText(main.name);
  await expect(productPage.relatedNames).toHaveText([first.name, second.name]);
});

test('should open a related product', async ({
  page,
  seedProduct,
  productPage,
}) => {
  const main = await seedProduct();
  const related = await seedProduct({ category_id: main.category.id });
  await productPage.open(main.id);
  await expect(productPage.name).toHaveText(main.name);

  await productPage.openRelated(related.name);

  await expect(page).toHaveURL(ProductPage.path);
  await expect(productPage.name).toHaveText(related.name);
});

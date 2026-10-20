import { test, expect } from './support/fixtures.js';
import { PRODUCT_DETAILS } from './data/shop.js';
import { ProductPage } from './pages/product.page.js';

test.beforeEach(async ({ homePage }) => {
  await homePage.open();
  await homePage.search(PRODUCT_DETAILS.name);
  await homePage.grid.openProduct(PRODUCT_DETAILS.name);
});

test('should show the details of the product opened from the list', async ({
  page,
  productPage,
}) => {
  await expect(page).toHaveURL(ProductPage.path);
  await expect(productPage.name).toHaveText(PRODUCT_DETAILS.name);
  await expect(productPage.price).toHaveText(PRODUCT_DETAILS.price);
  await expect(productPage.description).toContainText(
    PRODUCT_DETAILS.descriptionStart
  );
  await expect(productPage.relatedNames).toHaveText(PRODUCT_DETAILS.related);
});

test('should open a related product', async ({ page, productPage }) => {
  await productPage.openRelated(PRODUCT_DETAILS.relatedToOpen);

  await expect(page).toHaveURL(ProductPage.path);
  await expect(productPage.name).toHaveText(PRODUCT_DETAILS.relatedToOpen);
});

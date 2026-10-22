import { test, expect } from './support/fixtures.js';
import { FAVORITE_PRODUCT } from './data/shop.js';

let productId: string;

test.beforeEach(async ({ api, freshCustomer: _ }) => {
  const { data } = await api.products.search(FAVORITE_PRODUCT);
  const product = data.find(({ name }) => name === FAVORITE_PRODUCT);
  if (!product) {
    throw new Error(`Product "${FAVORITE_PRODUCT}" not found by search.`);
  }
  productId = product.id;
});

test('should add a product to favorites from the product page', async ({
  productPage,
  favoritesPage,
}) => {
  await productPage.open(productId);
  await expect(productPage.name).toHaveText(FAVORITE_PRODUCT);

  await productPage.addToFavorites();
  await expect(productPage.favoriteAddedAlert).toBeVisible();

  await favoritesPage.open();
  await expect(favoritesPage.heading).toBeVisible();
  await expect(favoritesPage.card(FAVORITE_PRODUCT)).toBeVisible();
});

test('should tell when the product is already a favorite', async ({
  freshCustomer,
  productPage,
  favoritesPage,
}) => {
  await freshCustomer.api.favorites.add(productId);

  await productPage.open(productId);
  await expect(productPage.name).toHaveText(FAVORITE_PRODUCT);

  await productPage.addToFavorites();
  await expect(productPage.favoriteDuplicateAlert).toBeVisible();

  await favoritesPage.open();
  await expect(favoritesPage.card(FAVORITE_PRODUCT)).toHaveCount(1);
});

test('should remove a favorite', async ({ freshCustomer, favoritesPage }) => {
  await freshCustomer.api.favorites.add(productId);

  await favoritesPage.open();
  await expect(favoritesPage.card(FAVORITE_PRODUCT)).toBeVisible();

  await favoritesPage.remove(FAVORITE_PRODUCT);
  await expect(favoritesPage.emptyMessage).toBeVisible();
  expect(await freshCustomer.api.favorites.list()).toEqual([]);
});

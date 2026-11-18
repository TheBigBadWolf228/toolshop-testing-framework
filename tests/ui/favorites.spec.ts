import { test, expect } from './support/fixtures.js';
import { findProduct } from '../api/seeders/product.seeder.js';
import { FAVORITE_PRODUCT } from './data/shop.js';

let productId: string;

test.beforeEach(async ({ api, freshCustomer: _ }) => {
  productId = (await findProduct(api, FAVORITE_PRODUCT)).id;
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

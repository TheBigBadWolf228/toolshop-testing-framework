import { test, expect } from './support/fixtures.js';
import { CART } from './data/shop.js';
import { CartPage } from './pages/cart.page.js';

const { name, price } = CART.product;

test.beforeEach(async ({ homePage, productPage }) => {
  await homePage.open();
  await homePage.search(name);
  await homePage.grid.openProduct(name);
  await expect(productPage.name).toHaveText(name);

  await productPage.addToCart();
  await expect(productPage.header.cartQuantity).toHaveText('1');
});

test('should show an added product in the cart', async ({
  page,
  productPage,
  cartPage,
}) => {
  await productPage.header.openCart();

  await expect(page).toHaveURL(CartPage.path);
  await expect(cartPage.titles).toHaveText([name]);
  await expect(cartPage.quantity(name)).toHaveValue('1');
  await expect(cartPage.unitPrices).toHaveText([price]);
  await expect(cartPage.linePrices).toHaveText([price]);
  await expect(cartPage.total).toHaveText(price);
});

test('should update the totals when the quantity changes', async ({
  productPage,
  cartPage,
}) => {
  await productPage.header.openCart();
  await expect(cartPage.titles).toHaveText([name]);

  await cartPage.setQuantity(name, CART.quantity);

  await expect(cartPage.quantity(name)).toHaveValue(String(CART.quantity));
  await expect(cartPage.unitPrices).toHaveText([price]);
  await expect(cartPage.linePrices).toHaveText([CART.quantityTotal]);
  await expect(cartPage.total).toHaveText(CART.quantityTotal);
  await expect(cartPage.header.cartQuantity).toHaveText(String(CART.quantity));
});

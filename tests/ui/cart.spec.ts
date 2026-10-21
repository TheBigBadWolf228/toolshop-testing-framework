import { test, expect } from './support/fixtures.js';
import { CART } from './data/shop.js';
import { CartPage } from './pages/cart.page.js';

test('should show an added product in the cart', async ({
  page,
  homePage,
  productPage,
  cartPage,
}) => {
  const { name, price } = CART.product;
  await homePage.open();
  await homePage.search(name);
  await homePage.grid.openProduct(name);
  await expect(productPage.name).toHaveText(name);

  await productPage.addToCart();
  await expect(productPage.header.cartQuantity).toHaveText('1');
  await productPage.header.openCart();

  await expect(page).toHaveURL(CartPage.path);
  await expect(cartPage.titles).toHaveText([name]);
  await expect(cartPage.quantity(name)).toHaveValue('1');
  await expect(cartPage.unitPrices).toHaveText([price]);
  await expect(cartPage.linePrices).toHaveText([price]);
  await expect(cartPage.total).toHaveText(price);
});

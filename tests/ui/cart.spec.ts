import { test, expect } from './support/fixtures.js';
import { CART } from './data/shop.js';
import { CartPage } from './pages/cart.page.js';

const { price, priceText } = CART.product;
let name: string;

test.beforeEach(async ({ seedProduct, productPage }) => {
  const product = await seedProduct({ price });
  name = product.name;

  await productPage.open(product.id);
  await expect(productPage.name).toHaveText(name);

  await productPage.addToCart();
  await expect(productPage.header.cartQuantity).toHaveText('1');
});

test(
  'should show an added product in the cart',
  { tag: '@smoke' },
  async ({ page, productPage, cartPage }) => {
    await productPage.header.openCart();

    await expect(page).toHaveURL(CartPage.path);
    await expect(cartPage.titles).toHaveText([name]);
    await expect(cartPage.quantity(name)).toHaveValue('1');
    await expect(cartPage.unitPrices).toHaveText([priceText]);
    await expect(cartPage.linePrices).toHaveText([priceText]);
    await expect(cartPage.total).toHaveText(priceText);
  }
);

test('should update the totals when the quantity changes', async ({
  productPage,
  cartPage,
}) => {
  await productPage.header.openCart();
  await expect(cartPage.titles).toHaveText([name]);

  await cartPage.setQuantity(name, CART.quantity);

  await expect(cartPage.quantity(name)).toHaveValue(String(CART.quantity));
  await expect(cartPage.unitPrices).toHaveText([priceText]);
  await expect(cartPage.linePrices).toHaveText([CART.quantityTotal]);
  await expect(cartPage.total).toHaveText(CART.quantityTotal);
  await expect(cartPage.header.cartQuantity).toHaveText(String(CART.quantity));
});

test('should empty the cart when the only product is removed', async ({
  productPage,
  cartPage,
}) => {
  await productPage.header.openCart();
  await expect(cartPage.titles).toHaveText([name]);

  await cartPage.remove(name);

  await expect(cartPage.removedAlert).toBeVisible();
  await expect(cartPage.titles).toHaveCount(0);
  await expect(cartPage.emptyMessage).toBeVisible();
  await expect(cartPage.header.cartLink).toBeHidden();
});

test('should sum the line totals of two products', async ({
  seedProduct,
  productPage,
  cartPage,
}) => {
  const second = CART.secondProduct;
  const { id, name: secondName } = await seedProduct({ price: second.price });
  await productPage.open(id);
  await expect(productPage.name).toHaveText(secondName);

  await productPage.addToCart();
  await expect(productPage.header.cartQuantity).toHaveText('2');
  await productPage.header.openCart();

  await expect(cartPage.titles).toHaveText([name, secondName]);
  await expect(cartPage.unitPrices).toHaveText([priceText, second.priceText]);
  await expect(cartPage.linePrices).toHaveText([priceText, second.priceText]);
  await expect(cartPage.total).toHaveText(CART.bothProductsTotal);
});

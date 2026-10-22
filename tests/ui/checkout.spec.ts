import { test, expect } from './support/fixtures.js';
import { restockProduct } from '../api/seeders/product.seeder.js';
import { CHECKOUT } from './data/shop.js';

const { product, address, filledAddress } = CHECKOUT;

test.use({ loggedInAs: 'customer' });

test('should place an order and show its invoice in the account', async ({
  api,
  productPage,
  cartPage,
  checkoutPage,
  invoicesPage,
}) => {
  const { id } = await restockProduct(api, product.name, CHECKOUT.stock);

  await productPage.open(id);
  await expect(productPage.name).toHaveText(product.name);
  await productPage.addToCart();
  await expect(productPage.header.cartQuantity).toHaveText('1');

  await productPage.header.openCart();
  await expect(cartPage.titles).toHaveText([product.name]);
  await expect(cartPage.total).toHaveText(product.totalText);
  await checkoutPage.proceed();

  await expect(checkoutPage.signedInMessage).toBeVisible();
  await checkoutPage.proceed();

  await checkoutPage.fillAddress(address);
  await expect(checkoutPage.street).toHaveValue(filledAddress.street);
  await expect(checkoutPage.city).toHaveValue(filledAddress.city);
  await expect(checkoutPage.state).toHaveValue(filledAddress.state);
  await checkoutPage.proceed();

  await checkoutPage.choosePayment(CHECKOUT.paymentMethod);
  await checkoutPage.finish();
  await expect(checkoutPage.paymentSuccess).toHaveText(CHECKOUT.paymentSuccess);
  await checkoutPage.finish();
  await expect(checkoutPage.confirmation).toContainText(CHECKOUT.confirmation);
  await expect(checkoutPage.confirmation).toContainText(
    CHECKOUT.invoiceNumberPattern
  );
  const invoiceNumber = await checkoutPage.invoiceNumber(
    CHECKOUT.invoiceNumberPattern
  );

  await invoicesPage.open();
  await expect(invoicesPage.heading).toBeVisible();
  const row = invoicesPage.row(invoiceNumber);
  await expect(row).toBeVisible();
  await expect(row).toContainText(product.totalText);
  await expect(row).toContainText(filledAddress.street);
});

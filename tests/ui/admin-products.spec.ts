import { test, expect } from './support/fixtures.js';
import { buildAdminProduct } from './factories/admin-product.factory.js';

test.describe('as admin', () => {
  test.use({ loggedInAs: 'admin' });

  test('should show a product in the shop when an admin creates it', async ({
    adminProductFormPage,
    productPage,
  }) => {
    const product = buildAdminProduct();

    await adminProductFormPage.open();
    await adminProductFormPage.fill(product);
    const id = await adminProductFormPage.save();

    await expect(adminProductFormPage.savedAlert).toBeVisible();

    await productPage.open(id);
    await expect(productPage.name).toHaveText(product.name);
    await expect(productPage.price).toHaveText(product.price);
  });
});

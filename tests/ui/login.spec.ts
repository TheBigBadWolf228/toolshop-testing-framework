import { test, expect } from './support/fixtures.js';

import { INVALID_CREDENTIALS } from './data/shop.js';
import { LoginPage } from './pages/login.page.js';

test.describe('as customer', () => {
  test.use({ loggedInAs: 'customer' });

  test('should log out', async ({ page, loginPage, accountPage }) => {
    await accountPage.open();
    await expect(accountPage.heading).toBeVisible();

    await accountPage.header.signOut();

    await expect(page).toHaveURL(LoginPage.path);
    await expect(loginPage.heading).toBeVisible();
  });
});

test('should not login with invalid credentials', async ({
  page,
  loginPage,
}) => {
  await loginPage.open();

  await loginPage.login(
    INVALID_CREDENTIALS.email,
    INVALID_CREDENTIALS.password
  );

  await expect(loginPage.errorMessage).toBeVisible();
  await expect(page).toHaveURL(LoginPage.path);
});

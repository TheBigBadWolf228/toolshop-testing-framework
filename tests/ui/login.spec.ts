import { test, expect } from './support/fixtures.js';

import { authFile } from '../support/auth.js';
import { getCredentials } from '../support/users.js';
import { INVALID_CREDENTIALS } from './data/shop.js';
import { AccountPage } from './pages/account.page.js';
import { LoginPage } from './pages/login.page.js';

const { email, password } = getCredentials('customer');

test('should login with valid credentials', async ({
  page,
  loginPage,
  accountPage,
}) => {
  await loginPage.open();

  await loginPage.login(email, password);

  await expect(page).toHaveURL(AccountPage.path);
  await expect(accountPage.heading).toBeVisible();
});

test.describe('as customer', () => {
  test.use({ storageState: authFile('customer') });

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

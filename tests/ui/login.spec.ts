import { test, expect } from '@playwright/test';

import { getCredentials } from '../support/users.js';
import { INVALID_CREDENTIALS } from './data/shop.js';
import { AccountPage } from './pages/account.page.js';
import { LoginPage } from './pages/login.page.js';

const { email, password } = getCredentials('customer');

test('should login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const accountPage = new AccountPage(page);
  await loginPage.open();

  await loginPage.login(email, password);

  await expect(page).toHaveURL(AccountPage.path);
  await expect(accountPage.heading).toBeVisible();
});

test('should log out', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const accountPage = new AccountPage(page);
  await loginPage.open();
  await loginPage.login(email, password);
  await expect(page).toHaveURL(AccountPage.path);

  await accountPage.header.signOut();

  await expect(page).toHaveURL(LoginPage.path);
  await expect(loginPage.heading).toBeVisible();
});

test('should not login with invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();

  await loginPage.login(
    INVALID_CREDENTIALS.email,
    INVALID_CREDENTIALS.password
  );

  await expect(loginPage.errorMessage).toBeVisible();
  await expect(page).toHaveURL(LoginPage.path);
});

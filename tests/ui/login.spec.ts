import { test, expect } from '@playwright/test';

import { getCredentials } from '../support/users.js';
import { LoginPage } from './pages/login.page.js';

const { email, password } = getCredentials('customer');

test('should login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();

  await loginPage.login(email, password);

  await expect(page).toHaveURL('/account');
  await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();
});

test('should log out', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(email, password);
  await expect(page).toHaveURL('/account');

  await page.getByTestId('nav-menu').click();
  await page.getByRole('listitem').filter({ hasText: 'Sign out' }).click();

  await expect(page).toHaveURL('/auth/login');
  await expect(loginPage.heading).toBeVisible();
});

test('should not login with invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();

  await loginPage.login('invalid@example.com', 'qwerty123');

  await expect(loginPage.errorMessage).toBeVisible();
  await expect(page).toHaveURL('/auth/login');
});

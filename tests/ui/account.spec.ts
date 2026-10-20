import { test, expect } from '@playwright/test';
import { authFile } from '../support/auth.js';
import { AccountPage } from './pages/account.page.js';
import { AdminDashboardPage } from './pages/admin-dashboard.page.js';

test.describe('as customer', () => {
  test.use({ storageState: authFile('customer') });

  test('should open my account without logging in via the form', async ({
    page,
  }) => {
    const accountPage = new AccountPage(page);
    await accountPage.open();

    await expect(accountPage.heading).toBeVisible();
  });
});

test.describe('as admin', () => {
  test.use({ storageState: authFile('admin') });

  test('should open the admin dashboard without logging in via the form', async ({
    page,
  }) => {
    const dashboardPage = new AdminDashboardPage(page);
    await dashboardPage.open();

    await expect(dashboardPage.heading).toBeVisible();
  });
});

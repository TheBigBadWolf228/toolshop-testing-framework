import { test, expect } from '@playwright/test';
import { authFile } from '../support/auth.js';

test.describe('as customer', () => {
  test.use({ storageState: authFile('customer') });

  test('should open my account without logging in via the form', async ({
    page,
  }) => {
    await page.goto('/account');

    await expect(
      page.getByRole('heading', { name: 'My account' })
    ).toBeVisible();
  });
});

test.describe('as admin', () => {
  test.use({ storageState: authFile('admin') });

  test('should open the admin dashboard without logging in via the form', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard');

    await expect(
      page.getByRole('heading', { name: 'Sales over the years' })
    ).toBeVisible();
  });
});

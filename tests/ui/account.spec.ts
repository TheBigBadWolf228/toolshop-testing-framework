import { test, expect } from './support/fixtures.js';
import { ADMIN_DASHBOARD_RENDER_ERROR } from './data/known-bugs.js';

test.describe('as customer', () => {
  test.use({ loggedInAs: 'customer' });

  test('should open my account without logging in via the form', async ({
    accountPage,
  }) => {
    await accountPage.open();

    await expect(accountPage.heading).toBeVisible();
  });
});

test.describe('as admin', ADMIN_DASHBOARD_RENDER_ERROR, () => {
  test.describe.configure({ retries: 2 });
  test.use({ loggedInAs: 'admin' });

  test('should open the admin dashboard without logging in via the form', async ({
    adminDashboardPage,
  }) => {
    await adminDashboardPage.open();

    await expect(adminDashboardPage.heading).toBeVisible();
  });
});

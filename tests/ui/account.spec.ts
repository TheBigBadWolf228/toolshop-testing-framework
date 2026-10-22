import { test, expect } from './support/fixtures.js';
import { ADMIN_DASHBOARD_RENDER_ERROR } from './data/known-bugs.js';
import { INVOICE_COLUMNS } from './data/shop.js';

test.describe('as customer', () => {
  test.use({ loggedInAs: 'customer' });

  test('should open my account without logging in via the form', async ({
    accountPage,
  }) => {
    await accountPage.open();

    await expect(accountPage.heading).toBeVisible();
  });
});

test.describe('as a new customer', () => {
  test('should show an empty invoices list', async ({
    freshCustomer: _,
    invoicesPage,
  }) => {
    await invoicesPage.open();

    await expect(invoicesPage.heading).toBeVisible();
    await expect(invoicesPage.columnHeaders).toHaveText([...INVOICE_COLUMNS]);
    await expect(invoicesPage.rows).toHaveCount(0);
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

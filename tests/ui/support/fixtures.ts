import { test as base, mergeTests } from '@playwright/test';
import { test as apiTest } from '../../api/support/fixtures.js';
import { AccountPage } from '../pages/account.page.js';
import { AdminDashboardPage } from '../pages/admin-dashboard.page.js';
import { CartPage } from '../pages/cart.page.js';
import { CategoryPage } from '../pages/category.page.js';
import { HomePage } from '../pages/home.page.js';
import { LoginPage } from '../pages/login.page.js';
import { ProductPage } from '../pages/product.page.js';

interface UiFixtures {
  homePage: HomePage;
  categoryPage: CategoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  adminDashboardPage: AdminDashboardPage;
}

const uiTest = base.extend<UiFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },
});

export const test = mergeTests(apiTest, uiTest);

export { expect } from '@playwright/test';

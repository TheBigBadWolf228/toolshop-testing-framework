import { test as base } from '@playwright/test';
import { AccountPage } from '../pages/account.page.js';
import { AdminDashboardPage } from '../pages/admin-dashboard.page.js';
import { CategoryPage } from '../pages/category.page.js';
import { HomePage } from '../pages/home.page.js';
import { LoginPage } from '../pages/login.page.js';
import { ProductPage } from '../pages/product.page.js';

interface UiFixtures {
  homePage: HomePage;
  categoryPage: CategoryPage;
  productPage: ProductPage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  adminDashboardPage: AdminDashboardPage;
}

export const test = base.extend<UiFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
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

export { expect } from '@playwright/test';

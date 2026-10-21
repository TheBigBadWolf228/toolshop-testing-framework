import { test as base, mergeTests } from '@playwright/test';
import type {
  CreatedProduct,
  ProductRequest,
} from '../../api/schemas/product.schema.js';
import { seedProduct } from '../../api/seeders/product.seeder.js';
import { Cleanup } from '../../api/support/cleanup.js';
import { test as apiTest } from '../../api/support/fixtures.js';
import { toStorageState } from '../../support/auth.js';
import type { Role } from '../../support/users.js';
import { NON_ECO_CO2_RATING } from '../data/shop.js';
import { AccountPage } from '../pages/account.page.js';
import { AdminDashboardPage } from '../pages/admin-dashboard.page.js';
import { CartPage } from '../pages/cart.page.js';
import { CategoryPage } from '../pages/category.page.js';
import { HomePage } from '../pages/home.page.js';
import { LoginPage } from '../pages/login.page.js';
import { ProductPage } from '../pages/product.page.js';
import { trackCarts } from './track-carts.js';

interface UiFixtures {
  homePage: HomePage;
  categoryPage: CategoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  adminDashboardPage: AdminDashboardPage;
}

interface SessionFixtures {
  loggedInAs: Role | undefined;
}

interface SeedFixtures {
  seedProduct: (overrides?: Partial<ProductRequest>) => Promise<CreatedProduct>;
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

export const test = mergeTests(apiTest, uiTest).extend<
  SessionFixtures & SeedFixtures
>({
  loggedInAs: [undefined, { option: true }],
  storageState: async ({ loggedInAs, tokens }, use) => {
    await use(
      loggedInAs ? toStorageState(await tokens.get(loggedInAs)) : undefined
    );
  },
  seedProduct: async ({ api, page, adminRequest }, use) => {
    const carts = new Cleanup(adminRequest);
    trackCarts(page, carts);
    await use((overrides) =>
      seedProduct(api, { co2_rating: NON_ECO_CO2_RATING, ...overrides })
    );
    await carts.run();
  },
});

export { expect } from '@playwright/test';

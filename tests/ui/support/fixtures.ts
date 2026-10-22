import { test as base, mergeTests } from '@playwright/test';
import { buildUser } from '../../api/factories/user.factory.js';
import type {
  CreatedProduct,
  ProductRequest,
} from '../../api/schemas/product.schema.js';
import type { NewUser } from '../../api/schemas/user.schema.js';
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
import { CheckoutPage } from '../pages/checkout.page.js';
import { HomePage } from '../pages/home.page.js';
import { InvoicesPage } from '../pages/invoices.page.js';
import { LoginPage } from '../pages/login.page.js';
import { ProductPage } from '../pages/product.page.js';
import { RegisterPage } from '../pages/register.page.js';
import { trackCarts } from './track-carts.js';

interface UiFixtures {
  homePage: HomePage;
  categoryPage: CategoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  accountPage: AccountPage;
  invoicesPage: InvoicesPage;
  adminDashboardPage: AdminDashboardPage;
}

interface SessionFixtures {
  loggedInAs: Role | undefined;
}

interface SeedFixtures {
  trackedCarts: void;
  seedProduct: (overrides?: Partial<ProductRequest>) => Promise<CreatedProduct>;
  newUser: NewUser;
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
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  invoicesPage: async ({ page }, use) => {
    await use(new InvoicesPage(page));
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
  // carts are deleted before the products in them.
  trackedCarts: [
    async ({ page, adminRequest, cleanup: _ }, use) => {
      const carts = new Cleanup(adminRequest);
      trackCarts(page, carts);
      await use();
      await carts.run();
    },
    { auto: true },
  ],
  seedProduct: async ({ api }, use) => {
    await use((overrides) =>
      seedProduct(api, { co2_rating: NON_ECO_CO2_RATING, ...overrides })
    );
  },
  newUser: async ({ api, cleanup }, use) => {
    const user = buildUser();
    cleanup.add(async () => {
      const { data } = await api.users.search(user.email);
      for (const { id } of data.filter(({ email }) => email === user.email)) {
        await api.users.delete(id);
      }
    });
    await use(user);
  },
});

export { expect } from '@playwright/test';

import { test as base, mergeTests } from '@playwright/test';
import { createApi, type Api } from '../../api/clients/api.js';
import { buildUser } from '../../api/factories/user.factory.js';
import type {
  CreatedProduct,
  ProductRequest,
} from '../../api/schemas/product.schema.js';
import type { NewUser } from '../../api/schemas/user.schema.js';
import { seedProduct } from '../../api/seeders/product.seeder.js';
import { seedUser, type SeededUser } from '../../api/seeders/user.seeder.js';
import { Cleanup } from '../../api/support/cleanup.js';
import { test as apiTest, newApiContext } from '../../api/support/fixtures.js';
import { TOKEN_KEY, toStorageState } from '../../support/auth.js';
import type { Role } from '../../support/users.js';
import { NON_ECO_CO2_RATING } from '../data/shop.js';
import { AccountPage } from '../pages/account.page.js';
import { AdminDashboardPage } from '../pages/admin-dashboard.page.js';
import { CartPage } from '../pages/cart.page.js';
import { CategoryPage } from '../pages/category.page.js';
import { CheckoutPage } from '../pages/checkout.page.js';
import { FavoritesPage } from '../pages/favorites.page.js';
import { HomePage } from '../pages/home.page.js';
import { InvoicesPage } from '../pages/invoices.page.js';
import { LoginPage } from '../pages/login.page.js';
import { ProductPage } from '../pages/product.page.js';
import { ProfilePage } from '../pages/profile.page.js';
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
  favoritesPage: FavoritesPage;
  profilePage: ProfilePage;
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
  freshCustomer: FreshCustomer;
}

interface FreshCustomer {
  user: SeededUser;
  api: Api;
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
  favoritesPage: async ({ page }, use) => {
    await use(new FavoritesPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
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
  // Favorites lock the user (409) and only their owner can delete them
  freshCustomer: async (
    { api, anonApi, cleanup, context, playwright },
    use
  ) => {
    const user = await seedUser(api);
    const { access_token } = await anonApi.users.login({
      email: user.email,
      password: user.password,
    });
    const request = await newApiContext(playwright, {
      Authorization: `Bearer ${access_token}`,
    });
    const userApi = createApi(request, cleanup);
    await context.addInitScript(
      ({ key, token }) => localStorage.setItem(key, token),
      { key: TOKEN_KEY, token: access_token }
    );
    try {
      await use({ user, api: userApi });
      for (const { id } of await userApi.favorites.list()) {
        await userApi.favorites.delete(id);
      }
    } finally {
      await request.dispose();
    }
  },
});

export { expect } from '@playwright/test';

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
import { AdminProductFormPage } from '../pages/admin-product-form.page.js';
import { CartPage } from '../pages/cart.page.js';
import { CategoryPage } from '../pages/category.page.js';
import { CheckoutPage } from '../pages/checkout.page.js';
import { ContactPage } from '../pages/contact.page.js';
import { FavoritesPage } from '../pages/favorites.page.js';
import { HomePage } from '../pages/home.page.js';
import { InvoicesPage } from '../pages/invoices.page.js';
import { LoginPage } from '../pages/login.page.js';
import { MessagesPage } from '../pages/messages.page.js';
import { ProductPage } from '../pages/product.page.js';
import { ProfilePage } from '../pages/profile.page.js';
import { RegisterPage } from '../pages/register.page.js';
import { BrowserLog } from './browser-log.js';
import { trackCarts } from './track-carts.js';
import { trackProducts } from './track-products.js';

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
  contactPage: ContactPage;
  messagesPage: MessagesPage;
  adminDashboardPage: AdminDashboardPage;
  adminProductFormPage: AdminProductFormPage;
}

interface SessionFixtures {
  loggedInAs: Role | undefined;
}

interface LogFixtures {
  browserLog: BrowserLog;
}

interface SeedFixtures {
  trackedCarts: void;
  trackedProducts: void;
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
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  messagesPage: async ({ page }, use) => {
    await use(new MessagesPage(page));
  },
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },
  adminProductFormPage: async ({ page }, use) => {
    await use(new AdminProductFormPage(page));
  },
});

export const test = mergeTests(apiTest, uiTest).extend<
  SessionFixtures & LogFixtures & SeedFixtures
>({
  loggedInAs: [undefined, { option: true }],
  storageState: async ({ loggedInAs, tokens }, use) => {
    await use(
      loggedInAs ? toStorageState(await tokens.get(loggedInAs)) : undefined
    );
  },
  browserLog: [
    async ({ page }, use, testInfo) => {
      const log = new BrowserLog(page);
      await use(log);
      if (
        testInfo.status !== testInfo.expectedStatus &&
        (await log.hasFindings())
      ) {
        await testInfo.attach('browser-log.md', {
          body: await log.toMarkdown(page.url()),
          contentType: 'text/markdown',
        });
      }
    },
    { auto: true },
  ],
  // carts are deleted before the products in them.
  trackedCarts: [
    async ({ page, adminRequest, cleanup: _ }, use) => {
      const carts = new Cleanup(adminRequest);
      const pending = trackCarts(page, carts);
      await use();
      await Promise.all(pending);
      await carts.run();
    },
    { auto: true },
  ],
  trackedProducts: [
    async ({ page, cleanup }, use) => {
      const pending = trackProducts(page, cleanup);
      await use();
      await Promise.all(pending);
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
    { api, anonApi, apiCallLog, cleanup, context, playwright },
    use
  ) => {
    const user = await seedUser(api);
    const { access_token } = await anonApi.users.login({
      email: user.email,
      password: user.password,
    });
    const request = await newApiContext(
      playwright,
      { Authorization: `Bearer ${access_token}` },
      apiCallLog
    );
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

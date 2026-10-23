import { test, expect } from './support/fixtures.js';
import { LOOKUP_ADDRESS, LOOKUP_ADDRESS_RESULT } from './data/shop.js';
import { AccountPage } from './pages/account.page.js';
import { LoginPage } from './pages/login.page.js';

test(
  'should register a new customer and log in with it',
  { tag: '@smoke' },
  async ({ page, newUser, registerPage, loginPage, accountPage }) => {
    await registerPage.open();
    await expect(registerPage.heading).toBeVisible();

    await registerPage.address.fill(LOOKUP_ADDRESS);
    await expect(registerPage.address.street).toHaveValue(
      LOOKUP_ADDRESS_RESULT.street
    );
    await expect(registerPage.address.city).toHaveValue(
      LOOKUP_ADDRESS_RESULT.city
    );
    await expect(registerPage.address.state).toHaveValue(
      LOOKUP_ADDRESS_RESULT.state
    );
    await registerPage.fillDetails(newUser);
    await registerPage.submit();

    await expect(page).toHaveURL(LoginPage.path);
    await loginPage.login(newUser.email, newUser.password);

    await expect(page).toHaveURL(AccountPage.path);
    await expect(accountPage.heading).toBeVisible();
    await expect(accountPage.header.userMenu).toHaveText(
      `${newUser.first_name} ${newUser.last_name}`
    );
  }
);

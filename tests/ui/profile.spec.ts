import { test, expect } from './support/fixtures.js';
import { buildUser } from '../api/factories/user.factory.js';
import { PROFILE_FORM_NOT_FILLED } from './data/known-bugs.js';

test.describe('profile', PROFILE_FORM_NOT_FILLED, () => {
  test.describe.configure({ retries: 2 });

  test('should update name and phone', async ({
    page,
    freshCustomer: { user },
    profilePage,
  }) => {
    const { first_name, last_name, phone } = buildUser();

    await profilePage.open();
    await expect(profilePage.heading).toBeVisible();
    await expect(profilePage.firstName).toHaveValue(user.first_name);

    await profilePage.update({ first_name, last_name, phone });
    await expect(profilePage.updatedAlert).toBeVisible();

    await page.reload();
    await expect(profilePage.firstName).toHaveValue(first_name);
    await expect(profilePage.lastName).toHaveValue(last_name);
    await expect(profilePage.phone).toHaveValue(phone);
    await expect(profilePage.header.userMenu).toHaveText(
      `${first_name} ${last_name}`
    );
  });
});

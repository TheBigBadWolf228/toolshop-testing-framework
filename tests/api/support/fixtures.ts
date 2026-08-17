import { test as base } from '@playwright/test';

export const fixtures = base.extend({
  authedRequest: async ({ request }, use) => {
    const response = await request.post('/users/login', {
      data: {
        email: 'customer@practicesoftwaretesting.com',
        password: 'welcome01',
      },
    });

    // countunie from here!
  },
});

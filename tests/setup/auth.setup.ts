import { test as setup } from '@playwright/test';
import { login } from '../api/support/tokens.js';
import { ROLES } from '../support/users.js';

for (const role of ROLES) {
  setup(`should login as ${role}`, async ({ request }) => {
    await login(request, role);
  });
}

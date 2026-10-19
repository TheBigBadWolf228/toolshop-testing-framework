import { test, expect } from './support/fixtures.js';
import { getCredentials } from '../support/users.js';
import { UNAUTHORIZED } from './data/access.js';
import { expectDenied } from './support/expect-denied.js';

interface CurrentUser {
  email: string;
  role: string;
}

test('should return the customer when customer token is sent', async ({
  customerRequest,
}) => {
  const response = await customerRequest.get('/users/me');

  expect(response.status()).toBe(200);
  const body = (await response.json()) as CurrentUser;
  expect(body.email).toBe(getCredentials('customer').email);
});

test('should return the admin when admin token is sent', async ({
  adminRequest,
}) => {
  const response = await adminRequest.get('/users/me');

  expect(response.status()).toBe(200);
  const body = (await response.json()) as CurrentUser;
  expect(body.email).toBe(getCredentials('admin').email);
  expect(body.role).toBe('admin');
});

test('should reject the request when token is missing', async ({ request }) => {
  const response = await request.get('/users/me');

  await expectDenied(response, UNAUTHORIZED, 'GET /users/me');
});

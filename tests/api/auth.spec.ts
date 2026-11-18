import { test, expect } from './support/fixtures.js';
import { getCredentials } from '../support/users.js';
import { UNAUTHORIZED } from './data/access.js';
import { expectDenied } from './support/expect-denied.js';
import { expectSchema } from './support/expect-schema.js';
import { CurrentUserSchema } from './schemas/user.schema.js';

test(
  'should return the customer when customer token is sent',
  { tag: '@smoke' },
  async ({ customerRequest }) => {
    const response = await customerRequest.get('/users/me');

    expect(response.status()).toBe(200);
    const body = expectSchema(
      CurrentUserSchema,
      await response.json(),
      'GET /users/me'
    );
    expect(body.email).toBe(getCredentials('customer').email);
  }
);

test(
  'should return the admin when admin token is sent',
  { tag: '@smoke' },
  async ({ adminRequest }) => {
    const response = await adminRequest.get('/users/me');

    expect(response.status()).toBe(200);
    const body = expectSchema(
      CurrentUserSchema,
      await response.json(),
      'GET /users/me'
    );
    expect(body.email).toBe(getCredentials('admin').email);
    expect(body.role).toBe('admin');
  }
);

test('should reject the request when token is missing', async ({
  anonRequest,
}) => {
  const response = await anonRequest.get('/users/me');

  await expectDenied(response, UNAUTHORIZED, 'GET /users/me');
});

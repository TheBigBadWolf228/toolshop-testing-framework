import { test as setup, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { authFile, toStorageState } from '../support/auth.js';
import { ROLES, getCredentials } from '../support/users.js';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

for (const role of ROLES) {
  setup(`should login as ${role} and save auth state`, async ({ request }) => {
    const response = await request.post('/users/login', {
      data: getCredentials(role),
    });
    expect(response.status()).toBe(200);

    const { access_token } = (await response.json()) as TokenResponse;
    expect(access_token).toBeTruthy();

    const file = authFile(role);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(
      file,
      JSON.stringify(toStorageState(access_token), null, 2)
    );
  });
}

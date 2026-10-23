import type { APIRequestContext } from '@playwright/test';
import { getCredentials, type Role } from '../../support/users.js';
import {
  TokenResponseSchema,
  type TokenResponse,
} from '../schemas/auth.schema.js';
import { expectStatus } from './expect-status.js';

const LOGIN = '/users/login';
const TOKEN_REFRESH_MARGIN_MS = 60_000;

export async function login(
  request: APIRequestContext,
  role: Role
): Promise<TokenResponse> {
  const credentials = getCredentials(role);
  const response = await request.post(LOGIN, { data: credentials });
  await expectStatus(
    response,
    200,
    `POST ${LOGIN} as ${role} (${credentials.email})`
  );
  return TokenResponseSchema.parse(await response.json());
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

export class Tokens {
  private readonly cache = new Map<Role, CachedToken>();

  constructor(private readonly request: APIRequestContext) {}

  async get(role: Role): Promise<string> {
    const cached = this.cache.get(role);
    if (cached && cached.expiresAt - Date.now() > TOKEN_REFRESH_MARGIN_MS) {
      return cached.token;
    }
    const { access_token, expires_in } = await login(this.request, role);
    this.cache.set(role, {
      token: access_token,
      expiresAt: Date.now() + expires_in * 1000,
    });
    return access_token;
  }
}

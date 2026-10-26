import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '../../support/step.js';
import type { Credentials } from '../../support/users.js';
import {
  TokenResponseSchema,
  type TokenResponse,
} from '../schemas/auth.schema.js';
import { IdSchema } from '../schemas/responses.schema.js';
import {
  RegisteredUserSchema,
  UserSearchPageSchema,
  type RegisterRequest,
  type RegisteredUser,
  type UserSearchPage,
} from '../schemas/user.schema.js';
import type { Cleanup } from '../support/cleanup.js';
import { expectStatus } from '../support/expect-status.js';

const USERS = '/users';

export class UsersClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly cleanup: Cleanup
  ) {}

  @step('POST /users/register')
  async registerRaw(data: Partial<RegisterRequest>): Promise<APIResponse> {
    const response = await this.request.post(`${USERS}/register`, { data });
    if (response.status() === 201) {
      const { id } = IdSchema.parse(await response.json());
      this.cleanup.addDelete(`user ${id}`, `${USERS}/${id}`);
    }
    return response;
  }

  @step('Register user')
  async register(data: RegisterRequest): Promise<RegisteredUser> {
    const response = await this.registerRaw(data);
    await expectStatus(response, 201, `POST ${USERS}/register`);
    return RegisteredUserSchema.parse(await response.json());
  }

  @step('POST /users/login')
  loginRaw(credentials: Credentials): Promise<APIResponse> {
    return this.request.post(`${USERS}/login`, { data: credentials });
  }

  @step('Log in via API')
  async login(credentials: Credentials): Promise<TokenResponse> {
    const response = await this.loginRaw(credentials);
    await expectStatus(
      response,
      200,
      `POST ${USERS}/login as ${credentials.email}`
    );
    return TokenResponseSchema.parse(await response.json());
  }

  @step('GET /users/search')
  searchRaw(query: string): Promise<APIResponse> {
    return this.request.get(`${USERS}/search`, { params: { q: query } });
  }

  @step('Search users for {0}')
  async search(query: string): Promise<UserSearchPage> {
    const response = await this.searchRaw(query);
    await expectStatus(response, 200, `GET ${USERS}/search?q=${query}`);
    return UserSearchPageSchema.parse(await response.json());
  }

  @step('DELETE /users/{0}')
  deleteRaw(id: string): Promise<APIResponse> {
    return this.request.delete(`${USERS}/${id}`);
  }

  @step('Delete user {0}')
  async delete(id: string): Promise<void> {
    await expectStatus(await this.deleteRaw(id), 204, `DELETE ${USERS}/${id}`);
  }
}

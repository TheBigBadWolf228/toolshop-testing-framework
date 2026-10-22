import type { APIRequestContext, APIResponse } from '@playwright/test';
import {
  UserSearchPageSchema,
  type UserSearchPage,
} from '../schemas/user.schema.js';
import { expectStatus } from '../support/expect-status.js';

const USERS = '/users';

export class UsersClient {
  constructor(private readonly request: APIRequestContext) {}

  searchRaw(query: string): Promise<APIResponse> {
    return this.request.get(`${USERS}/search`, { params: { q: query } });
  }

  async search(query: string): Promise<UserSearchPage> {
    const response = await this.searchRaw(query);
    await expectStatus(response, 200, `GET ${USERS}/search?q=${query}`);
    return UserSearchPageSchema.parse(await response.json());
  }

  deleteRaw(id: string): Promise<APIResponse> {
    return this.request.delete(`${USERS}/${id}`);
  }

  async delete(id: string): Promise<void> {
    await expectStatus(await this.deleteRaw(id), 204, `DELETE ${USERS}/${id}`);
  }
}

import type { APIRequestContext, APIResponse } from '@playwright/test';
import {
  FavoriteListSchema,
  FavoriteSchema,
  type Favorite,
  type FavoriteListItem,
} from '../schemas/favorite.schema.js';
import { expectStatus } from '../support/expect-status.js';

const FAVORITES = '/favorites';

export class FavoritesClient {
  constructor(private readonly request: APIRequestContext) {}

  listRaw(): Promise<APIResponse> {
    return this.request.get(FAVORITES);
  }

  async list(): Promise<FavoriteListItem[]> {
    const response = await this.listRaw();
    await expectStatus(response, 200, `GET ${FAVORITES}`);
    return FavoriteListSchema.parse(await response.json());
  }

  addRaw(productId: string): Promise<APIResponse> {
    return this.request.post(FAVORITES, { data: { product_id: productId } });
  }

  async add(productId: string): Promise<Favorite> {
    const response = await this.addRaw(productId);
    await expectStatus(response, 201, `POST ${FAVORITES}`);
    return FavoriteSchema.parse(await response.json());
  }

  deleteRaw(id: string): Promise<APIResponse> {
    return this.request.delete(`${FAVORITES}/${id}`);
  }

  async delete(id: string): Promise<void> {
    await expectStatus(
      await this.deleteRaw(id),
      204,
      `DELETE ${FAVORITES}/${id}`
    );
  }
}

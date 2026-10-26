import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '../../support/step.js';
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

  @step('GET /favorites')
  listRaw(): Promise<APIResponse> {
    return this.request.get(FAVORITES);
  }

  @step('List favorites')
  async list(): Promise<FavoriteListItem[]> {
    const response = await this.listRaw();
    await expectStatus(response, 200, `GET ${FAVORITES}`);
    return FavoriteListSchema.parse(await response.json());
  }

  @step('POST /favorites')
  addRaw(productId: string): Promise<APIResponse> {
    return this.request.post(FAVORITES, { data: { product_id: productId } });
  }

  @step('Add product {0} to favorites')
  async add(productId: string): Promise<Favorite> {
    const response = await this.addRaw(productId);
    await expectStatus(response, 201, `POST ${FAVORITES}`);
    return FavoriteSchema.parse(await response.json());
  }

  @step('DELETE /favorites/{0}')
  deleteRaw(id: string): Promise<APIResponse> {
    return this.request.delete(`${FAVORITES}/${id}`);
  }

  @step('Delete favorite {0}')
  async delete(id: string): Promise<void> {
    await expectStatus(
      await this.deleteRaw(id),
      204,
      `DELETE ${FAVORITES}/${id}`
    );
  }
}

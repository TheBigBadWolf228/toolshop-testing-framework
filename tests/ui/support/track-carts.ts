import type { Page, Request } from '@playwright/test';
import { IdSchema } from '../../api/schemas/responses.schema.js';
import type { Cleanup } from '../../api/support/cleanup.js';
import { API_URL } from '../../support/env.js';

const CARTS = '/carts';

function isCartCreate(request: Request): boolean {
  return request.method() === 'POST' && request.url() === `${API_URL}${CARTS}`;
}

export function trackCarts(page: Page, cleanup: Cleanup): Promise<void>[] {
  const pending: Promise<void>[] = [];
  page.on('request', (request) => {
    if (!isCartCreate(request)) {
      return;
    }
    pending.push(
      request.response().then(async (response) => {
        if (!response?.ok()) {
          return;
        }
        const { id } = IdSchema.parse(await response.json());
        cleanup.addDelete(`cart ${id}`, `${CARTS}/${id}`);
      })
    );
  });
  return pending;
}

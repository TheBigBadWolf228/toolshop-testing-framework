import type { Page, Response } from '@playwright/test';
import { IdSchema } from '../../api/schemas/responses.schema.js';
import type { Cleanup } from '../../api/support/cleanup.js';
import { API_URL } from '../../support/env.js';

const CARTS = '/carts';

function isCartCreated(response: Response): boolean {
  return (
    response.request().method() === 'POST' &&
    response.url() === `${API_URL}${CARTS}` &&
    response.ok()
  );
}

export function trackCarts(page: Page, cleanup: Cleanup): void {
  page.on('response', async (response) => {
    if (!isCartCreated(response)) {
      return;
    }
    const { id } = IdSchema.parse(await response.json());
    cleanup.addDelete(`cart ${id}`, `${CARTS}/${id}`);
  });
}

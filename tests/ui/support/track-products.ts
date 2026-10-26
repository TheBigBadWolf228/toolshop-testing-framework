import type { Page, Request } from '@playwright/test';
import { IdSchema } from '../../api/schemas/responses.schema.js';
import type { Cleanup } from '../../api/support/cleanup.js';
import { API_URL } from '../../support/env.js';

const PRODUCTS = '/products';

function isProductCreate(request: Request): boolean {
  return (
    request.method() === 'POST' && request.url() === `${API_URL}${PRODUCTS}`
  );
}

export function trackProducts(page: Page, cleanup: Cleanup): Promise<void>[] {
  const pending: Promise<void>[] = [];
  page.on('request', (request) => {
    if (!isProductCreate(request)) {
      return;
    }
    pending.push(
      request.response().then(async (response) => {
        if (!response?.ok()) {
          return;
        }
        const { id } = IdSchema.parse(await response.json());
        cleanup.addDelete(`product ${id}`, `${PRODUCTS}/${id}`);
      })
    );
  });
  return pending;
}

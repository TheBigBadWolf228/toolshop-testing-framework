import type { Page, Response } from '@playwright/test';
import { IdSchema } from '../../api/schemas/responses.schema.js';
import type { Cleanup } from '../../api/support/cleanup.js';
import { API_URL } from '../../support/env.js';

const PRODUCTS = '/products';

function isProductCreated(response: Response): boolean {
  return (
    response.request().method() === 'POST' &&
    response.url() === `${API_URL}${PRODUCTS}` &&
    response.ok()
  );
}

export function trackProducts(page: Page, cleanup: Cleanup): void {
  page.on('response', async (response) => {
    if (!isProductCreated(response)) {
      return;
    }
    const { id } = IdSchema.parse(await response.json());
    cleanup.addDelete(`product ${id}`, `${PRODUCTS}/${id}`);
  });
}

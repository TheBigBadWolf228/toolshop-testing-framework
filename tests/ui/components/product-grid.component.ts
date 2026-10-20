import type { Locator, Page } from '@playwright/test';

export class ProductGrid {
  readonly names: Locator;
  readonly prices: Locator;

  constructor(page: Page) {
    this.names = page.getByTestId('product-name');
    this.prices = page.getByTestId('product-price');
  }

  async readNames(): Promise<string[]> {
    await this.names.first().waitFor();
    return (await this.names.allTextContents()).map((name) => name.trim());
  }

  async readPrices(): Promise<number[]> {
    await this.prices.first().waitFor();
    return (await this.prices.allTextContents()).map((price) =>
      Number(price.trim().replace('$', ''))
    );
  }
}

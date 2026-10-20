import type { Locator, Page } from '@playwright/test';

export class ProductGrid {
  readonly names: Locator;
  readonly prices: Locator;
  readonly co2Ratings: Locator;

  constructor(page: Page) {
    this.names = page.getByTestId('product-name');
    this.prices = page.getByTestId('product-price');
    this.co2Ratings = page
      .getByTestId('co2-rating-badge')
      .locator('.co2-letter.active');
  }

  readNames(): Promise<string[]> {
    return this.readTexts(this.names);
  }

  async readPrices(): Promise<number[]> {
    return (await this.readTexts(this.prices)).map((price) =>
      Number(price.replace('$', ''))
    );
  }

  readCo2Ratings(): Promise<string[]> {
    return this.readTexts(this.co2Ratings);
  }

  private async readTexts(locator: Locator): Promise<string[]> {
    await locator.first().waitFor();
    return (await locator.allTextContents()).map((text) => text.trim());
  }
}

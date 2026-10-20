import type { Locator, Page } from '@playwright/test';

export class ProductPage {
  static readonly path = /\/product\/[A-Z0-9]+$/;

  readonly name: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly relatedNames: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('product-name');
    this.price = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.relatedNames = page
      .getByRole('heading', { name: 'Related products' })
      .locator('..')
      .getByRole('heading', { level: 5 });
  }

  async openRelated(name: string): Promise<void> {
    await this.relatedNames
      .and(this.page.getByText(name, { exact: true }))
      .click();
  }
}

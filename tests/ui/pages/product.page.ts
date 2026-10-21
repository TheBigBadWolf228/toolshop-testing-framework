import type { Locator, Page } from '@playwright/test';
import { Header } from '../components/header.component.js';

export class ProductPage {
  static readonly path = /\/product\/[a-z0-9]+$/i;

  readonly header: Header;
  readonly name: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly addToCartButton: Locator;
  readonly relatedNames: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.name = page.getByTestId('product-name');
    this.price = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.relatedNames = page
      .getByRole('heading', { name: 'Related products' })
      .locator('..')
      .getByRole('heading', { level: 5 });
  }

  async open(id: string): Promise<void> {
    await this.page.goto(`/product/${id}`);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async openRelated(name: string): Promise<void> {
    await this.relatedNames
      .and(this.page.getByText(name, { exact: true }))
      .click();
  }
}

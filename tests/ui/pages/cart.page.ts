import type { Locator, Page } from '@playwright/test';
import { Header } from '../components/header.component.js';

export class CartPage {
  static readonly path = '/checkout';

  readonly header: Header;
  readonly titles: Locator;
  readonly unitPrices: Locator;
  readonly linePrices: Locator;
  readonly total: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.titles = page.getByTestId('product-title');
    this.unitPrices = page.getByTestId('product-price');
    this.linePrices = page.getByTestId('line-price');
    this.total = page.getByTestId('cart-total');
  }

  quantity(name: string): Locator {
    return this.page.getByRole('spinbutton', {
      name: `Quantity for ${name}`,
      exact: true,
    });
  }

  async setQuantity(name: string, quantity: number): Promise<void> {
    const input = this.quantity(name);
    await input.fill(String(quantity));
    await input.press('Tab');
  }
}

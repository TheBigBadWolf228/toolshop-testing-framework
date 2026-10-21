import type { Locator, Page } from '@playwright/test';

export class CartPage {
  static readonly path = '/checkout';

  readonly titles: Locator;
  readonly unitPrices: Locator;
  readonly linePrices: Locator;
  readonly total: Locator;

  constructor(private readonly page: Page) {
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
}

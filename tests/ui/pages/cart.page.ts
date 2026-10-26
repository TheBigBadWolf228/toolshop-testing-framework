import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';
import { Header } from '../components/header.component.js';

export class CartPage {
  static readonly path = '/checkout';

  readonly header: Header;
  readonly titles: Locator;
  readonly unitPrices: Locator;
  readonly linePrices: Locator;
  readonly total: Locator;
  readonly emptyMessage: Locator;
  readonly removedAlert: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.titles = page.getByTestId('product-title');
    this.unitPrices = page.getByTestId('product-price');
    this.linePrices = page.getByTestId('line-price');
    this.total = page.getByTestId('cart-total');
    this.emptyMessage = page.getByText(
      'The cart is empty. Nothing to display.'
    );
    this.removedAlert = page
      .getByRole('alert')
      .filter({ hasText: 'Product deleted.' });
  }

  quantity(name: string): Locator {
    return this.page.getByRole('spinbutton', {
      name: `Quantity for ${name}`,
      exact: true,
    });
  }

  @step('Set quantity of {0} to {1}')
  async setQuantity(name: string, quantity: number): Promise<void> {
    const input = this.quantity(name);
    await input.fill(String(quantity));
    await input.press('Tab');
  }

  @step('Remove {0} from cart')
  async remove(name: string): Promise<void> {
    await this.row(name).locator('.btn-danger').click();
  }

  private row(name: string): Locator {
    return this.page
      .getByRole('row')
      .filter({ has: this.titles.getByText(name, { exact: true }) });
  }
}

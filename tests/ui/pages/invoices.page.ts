import type { Locator, Page } from '@playwright/test';

export class InvoicesPage {
  static readonly path = '/account/invoices';

  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Invoices' });
  }

  async open(): Promise<void> {
    await this.page.goto(InvoicesPage.path);
  }

  row(invoiceNumber: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: invoiceNumber, exact: true }),
    });
  }
}

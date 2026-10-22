import type { Locator, Page } from '@playwright/test';

export class InvoicesPage {
  static readonly path = '/account/invoices';

  readonly heading: Locator;
  readonly columnHeaders: Locator;
  readonly rows: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Invoices' });
    this.columnHeaders = page.getByRole('columnheader');
    this.rows = page.getByRole('row').filter({ has: page.getByRole('cell') });
  }

  async open(): Promise<void> {
    const invoicesLoaded = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/invoices'
    );
    await this.page.goto(InvoicesPage.path);
    await invoicesLoaded;
  }

  row(invoiceNumber: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: invoiceNumber, exact: true }),
    });
  }
}

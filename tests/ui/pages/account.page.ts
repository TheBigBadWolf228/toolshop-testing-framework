import type { Locator, Page } from '@playwright/test';

export class AccountPage {
  static readonly path = '/account';

  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'My account' });
  }

  async open(): Promise<void> {
    await this.page.goto(AccountPage.path);
  }
}

import type { Locator, Page } from '@playwright/test';

export class AdminDashboardPage {
  static readonly path = '/admin/dashboard';

  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Sales over the years' });
  }

  async open(): Promise<void> {
    await this.page.goto(AdminDashboardPage.path);
  }
}

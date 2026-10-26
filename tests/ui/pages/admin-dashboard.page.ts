import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';

export class AdminDashboardPage {
  static readonly path = '/admin/dashboard';

  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Sales over the years' });
  }

  @step('Open admin dashboard')
  async open(): Promise<void> {
    await this.page.goto(AdminDashboardPage.path);
  }
}

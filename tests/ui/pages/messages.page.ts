import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';

const STATUS_COLUMN = 2;

export class MessagesPage {
  static readonly path = '/account/messages';

  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Messages' });
  }

  @step('Open messages')
  async open(): Promise<void> {
    await this.page.goto(MessagesPage.path);
  }

  row(subject: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: subject, exact: true }),
    });
  }

  status(subject: string): Locator {
    return this.row(subject).getByRole('cell').nth(STATUS_COLUMN);
  }
}

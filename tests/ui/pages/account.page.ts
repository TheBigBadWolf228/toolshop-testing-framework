import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';
import { Header } from '../components/header.component.js';

export class AccountPage {
  static readonly path = '/account';

  readonly header: Header;
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.heading = page.getByRole('heading', { name: 'My account' });
  }

  @step('Open account page')
  async open(): Promise<void> {
    await this.page.goto(AccountPage.path);
  }
}

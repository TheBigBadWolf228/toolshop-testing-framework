import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';

export class LoginPage {
  static readonly path = '/auth/login';

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly heading: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByPlaceholder('Your email');
    this.passwordInput = page.getByPlaceholder('Your password');
    this.submitButton = page.getByRole('button', { name: 'Login' });
    this.heading = page.getByRole('heading', { name: 'Login' });
    this.errorMessage = page.getByText('Invalid email or password');
  }

  @step('Open login page')
  async open(): Promise<void> {
    await this.page.goto(LoginPage.path);
  }

  @step('Log in as {0}')
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

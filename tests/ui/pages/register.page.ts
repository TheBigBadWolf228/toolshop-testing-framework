import type { Locator, Page } from '@playwright/test';
import type { NewUser } from '../../api/schemas/user.schema.js';
import { AddressForm } from '../components/address-form.component.js';

export class RegisterPage {
  static readonly path = '/auth/register';

  readonly address: AddressForm;
  readonly heading: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly dob: Locator;
  readonly phone: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.address = new AddressForm(page);
    this.heading = page.getByRole('heading', { name: 'Customer registration' });
    this.firstName = page.getByRole('textbox', { name: 'First name' });
    this.lastName = page.getByRole('textbox', { name: 'Last name' });
    this.dob = page.getByRole('textbox', { name: 'Date of Birth' });
    this.phone = page.getByRole('textbox', { name: 'Phone' });
    this.email = page.getByRole('textbox', { name: 'Email address' });
    this.password = page.getByLabel('Password', { exact: true });
    this.submitButton = page.getByRole('button', { name: 'Register' });
  }

  async open(): Promise<void> {
    await this.page.goto(RegisterPage.path);
  }

  async fillDetails(user: NewUser): Promise<void> {
    await this.firstName.fill(user.first_name);
    await this.lastName.fill(user.last_name);
    await this.dob.fill(user.dob);
    await this.phone.fill(user.phone);
    await this.email.fill(user.email);
    await this.password.fill(user.password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}

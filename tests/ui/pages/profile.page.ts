import type { Locator, Page } from '@playwright/test';
import type { NewUser } from '../../api/schemas/user.schema.js';
import { Header } from '../components/header.component.js';

export type ProfileChanges = Pick<
  NewUser,
  'first_name' | 'last_name' | 'phone'
>;

export class ProfilePage {
  static readonly path = '/account/profile';

  readonly header: Header;
  readonly heading: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly phone: Locator;
  readonly updateButton: Locator;
  readonly updatedAlert: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.heading = page.getByRole('heading', { name: 'Profile' });
    this.firstName = page.getByRole('textbox', { name: 'First name' });
    this.lastName = page.getByRole('textbox', { name: 'Last name' });
    this.phone = page.getByRole('textbox', { name: 'Phone' });
    this.updateButton = page.getByRole('button', { name: 'Update Profile' });
    this.updatedAlert = page
      .getByRole('alert')
      .filter({ hasText: 'Your profile is successfully updated!' });
  }

  async open(): Promise<void> {
    await this.page.goto(ProfilePage.path);
  }

  async update(changes: ProfileChanges): Promise<void> {
    await this.firstName.fill(changes.first_name);
    await this.lastName.fill(changes.last_name);
    await this.phone.fill(changes.phone);
    await this.updateButton.click();
  }
}

import type { Locator, Page } from '@playwright/test';

export interface AddressInput {
  country: string;
  postalCode: string;
  houseNumber: string;
}

export class AddressForm {
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly houseNumber: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;

  constructor(page: Page) {
    this.country = page.getByRole('combobox', { name: 'Country' });
    this.postalCode = page.getByRole('textbox', { name: 'Postal code' });
    this.houseNumber = page.getByRole('textbox', { name: 'House number' });
    this.street = page.getByRole('textbox', { name: 'Street' });
    this.city = page.getByRole('textbox', { name: 'City' });
    this.state = page.getByRole('textbox', { name: 'State' });
  }

  async fill(address: AddressInput): Promise<void> {
    await this.country.selectOption({ label: address.country });
    await this.postalCode.fill(address.postalCode);
    await this.houseNumber.fill(address.houseNumber);
    await this.houseNumber.press('Tab');
  }
}

import type { Locator, Page } from '@playwright/test';

export interface CheckoutAddress {
  country: string;
  postalCode: string;
  houseNumber: string;
}

export class CheckoutPage {
  readonly proceedButton: Locator;
  readonly signedInMessage: Locator;
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly houseNumber: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccess: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    this.proceedButton = page
      .getByRole('button', { name: 'Proceed to checkout' })
      .filter({ visible: true });
    this.signedInMessage = page.getByText('you are already logged in');
    this.country = page.getByRole('combobox', { name: 'Country' });
    this.postalCode = page.getByRole('textbox', { name: 'Postal code' });
    this.houseNumber = page.getByRole('textbox', { name: 'House number' });
    this.street = page.getByRole('textbox', { name: 'Street' });
    this.city = page.getByRole('textbox', { name: 'City' });
    this.state = page.getByRole('textbox', { name: 'State' });
    this.paymentMethod = page.getByRole('combobox', { name: 'Payment Method' });
    // Label changes from "Check payment" to "Confirm" after the first click.
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.confirmation = page.getByText('Your invoice number is');
  }

  async proceed(): Promise<void> {
    await this.proceedButton.click();
  }

  async fillAddress(address: CheckoutAddress): Promise<void> {
    await this.country.selectOption({ label: address.country });
    await this.postalCode.fill(address.postalCode);
    await this.houseNumber.fill(address.houseNumber);
    await this.houseNumber.press('Tab');
  }

  async choosePayment(method: string): Promise<void> {
    await this.paymentMethod.selectOption({ label: method });
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  // The number has no element of its own in the rendered message.
  async invoiceNumber(pattern: RegExp): Promise<string> {
    const match = (await this.confirmation.innerText()).match(pattern);
    if (!match) {
      throw new Error(`No invoice number matching ${pattern} in confirmation.`);
    }
    return match[0];
  }
}

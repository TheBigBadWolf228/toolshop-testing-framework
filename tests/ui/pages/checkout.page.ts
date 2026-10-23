import type { Locator, Page } from '@playwright/test';
import { AddressForm } from '../components/address-form.component.js';

export class CheckoutPage {
  readonly address: AddressForm;
  readonly proceedButton: Locator;
  readonly signedInMessage: Locator;
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccess: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    this.address = new AddressForm(page);
    this.proceedButton = page
      .getByRole('button', { name: 'Proceed to checkout' })
      .filter({ visible: true });
    this.signedInMessage = page.getByText('you are already logged in');
    this.paymentMethod = page.getByRole('combobox', { name: 'Payment Method' });
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.confirmation = page.getByText('Your invoice number is');
  }

  async proceed(): Promise<void> {
    await this.proceedButton.click();
  }

  async choosePayment(method: string): Promise<void> {
    await this.paymentMethod.selectOption({ label: method });
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async invoiceNumber(pattern: RegExp): Promise<string> {
    const match = (await this.confirmation.innerText()).match(pattern);
    if (!match) {
      throw new Error(`No invoice number matching ${pattern} in confirmation.`);
    }
    return match[0];
  }
}

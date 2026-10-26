import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';

export class Header {
  readonly categoriesMenu: Locator;
  readonly userMenu: Locator;
  readonly signOutLink: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;

  constructor(private readonly page: Page) {
    this.categoriesMenu = page.getByTestId('nav-categories');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOutLink = page.getByTestId('nav-sign-out');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  @step('Open category {0}')
  async openCategory(name: string): Promise<void> {
    await this.categoriesMenu.click();
    await this.page
      .getByRole('navigation')
      .getByRole('link', { name, exact: true })
      .click();
  }

  @step('Open cart')
  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  @step('Sign out')
  async signOut(): Promise<void> {
    await this.userMenu.click();
    await this.signOutLink.click();
  }
}

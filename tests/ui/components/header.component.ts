import type { Locator, Page } from '@playwright/test';

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

  async openCategory(name: string): Promise<void> {
    await this.categoriesMenu.click();
    await this.page
      .getByRole('navigation')
      .getByRole('link', { name, exact: true })
      .click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async signOut(): Promise<void> {
    await this.userMenu.click();
    await this.signOutLink.click();
  }
}

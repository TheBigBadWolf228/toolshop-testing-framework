import type { Locator, Page } from '@playwright/test';

export class Header {
  readonly categoriesMenu: Locator;
  readonly userMenu: Locator;
  readonly signOutLink: Locator;

  constructor(private readonly page: Page) {
    this.categoriesMenu = page.getByTestId('nav-categories');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOutLink = page.getByTestId('nav-sign-out');
  }

  async openCategory(name: string): Promise<void> {
    await this.categoriesMenu.click();
    await this.page
      .getByRole('navigation')
      .getByRole('link', { name, exact: true })
      .click();
  }

  async signOut(): Promise<void> {
    await this.userMenu.click();
    await this.signOutLink.click();
  }
}

import type { Locator, Page } from '@playwright/test';

export class FavoritesPage {
  static readonly path = '/account/favorites';

  readonly heading: Locator;
  readonly emptyMessage: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Favorites' });
    this.emptyMessage = page.getByText('There are no favorites yet.');
  }

  async open(): Promise<void> {
    await this.page.goto(FavoritesPage.path);
  }

  card(name: string): Locator {
    return this.page.getByTestId(/^favorite-/).filter({
      has: this.page.getByRole('heading', { name, exact: true }),
    });
  }

  async remove(name: string): Promise<void> {
    await this.card(name).getByTestId('delete').click();
  }
}

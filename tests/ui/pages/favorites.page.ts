import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';

export class FavoritesPage {
  static readonly path = '/account/favorites';

  readonly heading: Locator;
  readonly emptyMessage: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Favorites' });
    this.emptyMessage = page.getByText('There are no favorites yet.');
  }

  @step('Open favorites')
  async open(): Promise<void> {
    await this.page.goto(FavoritesPage.path);
  }

  card(name: string): Locator {
    return this.page.getByTestId(/^favorite-/).filter({
      has: this.page.getByRole('heading', { name, exact: true }),
    });
  }

  @step('Remove {0} from favorites')
  async remove(name: string): Promise<void> {
    await this.card(name).getByTestId('delete').click();
  }
}

import type { Locator, Page } from '@playwright/test';
import { Filters } from '../components/filters.component.js';
import { ProductGrid } from '../components/product-grid.component.js';

export class HomePage {
  static readonly path = '/';

  readonly grid: ProductGrid;
  readonly filters: Filters;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;

  constructor(private readonly page: Page) {
    this.grid = new ProductGrid(page);
    this.filters = new Filters(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.resetButton = page.getByTestId('search-reset');
  }

  async open(): Promise<void> {
    await this.page.goto(HomePage.path);
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async resetSearch(): Promise<void> {
    await this.resetButton.click();
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.page
      .getByRole('button', { name: `Page-${pageNumber}`, exact: true })
      .click();
  }
}

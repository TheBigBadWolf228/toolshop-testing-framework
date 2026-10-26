import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';
import { Filters } from '../components/filters.component.js';
import { Header } from '../components/header.component.js';
import { ProductGrid } from '../components/product-grid.component.js';

export class HomePage {
  static readonly path = '/';

  readonly header: Header;
  readonly grid: ProductGrid;
  readonly filters: Filters;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.grid = new ProductGrid(page);
    this.filters = new Filters(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.resetButton = page.getByTestId('search-reset');
  }

  @step('Open home page')
  async open(): Promise<void> {
    await this.page.goto(HomePage.path);
  }

  @step('Search for {0}')
  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  @step('Reset search')
  async resetSearch(): Promise<void> {
    await this.resetButton.click();
  }

  @step('Go to page {0}')
  async goToPage(pageNumber: number): Promise<void> {
    await this.page
      .getByRole('button', { name: `Page-${pageNumber}`, exact: true })
      .click();
  }
}

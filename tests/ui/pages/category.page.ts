import type { Locator, Page } from '@playwright/test';
import { Filters } from '../components/filters.component.js';
import { Header } from '../components/header.component.js';
import { ProductGrid } from '../components/product-grid.component.js';

export class CategoryPage {
  readonly header: Header;
  readonly grid: ProductGrid;
  readonly filters: Filters;
  readonly title: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    this.header = new Header(page);
    this.grid = new ProductGrid(page);
    this.filters = new Filters(page);
    this.title = page.getByTestId('page-title');
    this.sortSelect = page.getByTestId('sort');
  }

  async sortBy(label: string): Promise<void> {
    await this.sortSelect.selectOption({ label });
  }
}

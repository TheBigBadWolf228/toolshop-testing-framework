import type { Locator, Page } from '@playwright/test';
import { step } from '../../support/step.js';
import { Header } from '../components/header.component.js';

export class ProductPage {
  static readonly path = /\/product\/[a-z0-9]+$/i;

  readonly header: Header;
  readonly name: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly addToCartButton: Locator;
  readonly addToFavoritesButton: Locator;
  readonly favoriteAddedAlert: Locator;
  readonly favoriteDuplicateAlert: Locator;
  readonly relatedNames: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.name = page.getByTestId('product-name');
    this.price = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addToFavoritesButton = page.getByRole('button', {
      name: 'Add to favourites',
    });
    this.favoriteAddedAlert = page
      .getByRole('alert')
      .filter({ hasText: 'Product added to your favorites list.' });
    this.favoriteDuplicateAlert = page
      .getByRole('alert')
      .filter({ hasText: 'Product already in your favorites list.' });
    this.relatedNames = page
      .getByRole('heading', { name: 'Related products' })
      .locator('..')
      .getByRole('heading', { level: 5 });
  }

  @step('Open product {0}')
  async open(id: string): Promise<void> {
    await this.page.goto(`/product/${id}`);
  }

  @step('Add to cart')
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  @step('Add to favorites')
  async addToFavorites(): Promise<void> {
    await this.addToFavoritesButton.click();
  }

  @step('Open related product {0}')
  async openRelated(name: string): Promise<void> {
    await this.relatedNames
      .and(this.page.getByText(name, { exact: true }))
      .click();
  }
}

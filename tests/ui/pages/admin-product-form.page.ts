import type { Locator, Page } from '@playwright/test';
import { IdSchema } from '../../api/schemas/responses.schema.js';
import { API_URL } from '../../support/env.js';

export interface AdminProductForm {
  name: string;
  description: string;
  stock: number;
  price: string;
  brand: string;
  category: string;
  image: string;
}

export class AdminProductFormPage {
  static readonly path = '/admin/products/add';

  readonly name: Locator;
  readonly description: Locator;
  readonly stock: Locator;
  readonly price: Locator;
  readonly brand: Locator;
  readonly category: Locator;
  readonly image: Locator;
  readonly saveButton: Locator;
  readonly savedAlert: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByRole('textbox', { name: 'Name', exact: true });
    this.description = page.getByRole('textbox', { name: 'Description' });
    this.stock = page.getByRole('textbox', { name: 'Stock' });
    this.price = page.getByRole('textbox', { name: 'Price' });
    this.brand = page.getByRole('combobox', { name: 'Brand' });
    this.category = page.getByRole('combobox', { name: 'Category' });
    this.image = page.getByRole('combobox', { name: 'Image' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.savedAlert = page
      .getByRole('alert')
      .filter({ hasText: 'Product saved!' });
  }

  async open(): Promise<void> {
    await this.page.goto(AdminProductFormPage.path);
  }

  async fill(product: AdminProductForm): Promise<void> {
    await this.name.fill(product.name);
    await this.description.fill(product.description);
    await this.stock.fill(String(product.stock));
    await this.price.fill(product.price);
    await this.brand.selectOption({ label: product.brand });
    await this.category.selectOption({ label: product.category });
    await this.image.selectOption({ label: product.image });
  }

  async save(): Promise<string> {
    const created = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url() === `${API_URL}/products`
    );
    await this.saveButton.click();
    const response = await created;
    if (response.status() !== 201) {
      throw new Error(
        `POST /products failed: ${response.status()} ${await response.text()}`
      );
    }
    return IdSchema.parse(await response.json()).id;
  }
}

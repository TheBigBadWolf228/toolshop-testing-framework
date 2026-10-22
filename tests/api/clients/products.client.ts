import type { APIRequestContext, APIResponse } from '@playwright/test';
import {
  CreatedProductSchema,
  ProductPageSchema,
  ProductSchema,
  ProductSearchPageSchema,
  type CreatedProduct,
  type Product,
  type ProductPage,
  type ProductSearchPage,
  type ProductRequest,
} from '../schemas/product.schema.js';
import { IdSchema, SuccessSchema } from '../schemas/responses.schema.js';
import type { Cleanup } from '../support/cleanup.js';
import { expectStatus } from '../support/expect-status.js';

const PRODUCTS = '/products';

export interface ProductListParams {
  page?: number;
  by_brand?: string;
  by_category?: string;
}

export class ProductsClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly cleanup: Cleanup
  ) {}

  listRaw(params: ProductListParams = {}): Promise<APIResponse> {
    return this.request.get(PRODUCTS, { params: { ...params } });
  }

  async list(params: ProductListParams = {}): Promise<ProductPage> {
    const response = await this.listRaw(params);
    await expectStatus(response, 200, `GET ${PRODUCTS}`);
    return ProductPageSchema.parse(await response.json());
  }

  async search(query: string): Promise<ProductSearchPage> {
    const response = await this.request.get(`${PRODUCTS}/search`, {
      params: { q: query },
    });
    await expectStatus(response, 200, `GET ${PRODUCTS}/search`);
    return ProductSearchPageSchema.parse(await response.json());
  }

  getRaw(id: string): Promise<APIResponse> {
    return this.request.get(`${PRODUCTS}/${id}`);
  }

  async get(id: string): Promise<Product> {
    const response = await this.getRaw(id);
    await expectStatus(response, 200, `GET ${PRODUCTS}/${id}`);
    return ProductSchema.parse(await response.json());
  }

  async createRaw(data: Partial<ProductRequest>): Promise<APIResponse> {
    const response = await this.request.post(PRODUCTS, { data });
    if (response.status() === 201) {
      const { id } = IdSchema.parse(await response.json());
      this.cleanup.addDelete(`product ${id}`, `${PRODUCTS}/${id}`);
    }
    return response;
  }

  async create(data: ProductRequest): Promise<CreatedProduct> {
    const response = await this.createRaw(data);
    await expectStatus(response, 201, `POST ${PRODUCTS}`);
    return CreatedProductSchema.parse(await response.json());
  }

  updateRaw(id: string, data: Partial<ProductRequest>): Promise<APIResponse> {
    return this.request.put(`${PRODUCTS}/${id}`, { data });
  }

  async update(id: string, data: ProductRequest): Promise<void> {
    const response = await this.updateRaw(id, data);
    await expectStatus(response, 200, `PUT ${PRODUCTS}/${id}`);
    SuccessSchema.parse(await response.json());
  }

  async setStock(id: string, stock: number): Promise<void> {
    const response = await this.updateRaw(id, { stock });
    await expectStatus(response, 200, `PUT ${PRODUCTS}/${id}`);
    SuccessSchema.parse(await response.json());
  }

  patchRaw(id: string, data: Partial<ProductRequest>): Promise<APIResponse> {
    return this.request.patch(`${PRODUCTS}/${id}`, { data });
  }

  async patch(id: string, data: Partial<ProductRequest>): Promise<void> {
    const response = await this.patchRaw(id, data);
    await expectStatus(response, 200, `PATCH ${PRODUCTS}/${id}`);
    SuccessSchema.parse(await response.json());
  }

  deleteRaw(id: string): Promise<APIResponse> {
    return this.request.delete(`${PRODUCTS}/${id}`);
  }

  async delete(id: string): Promise<void> {
    await expectStatus(
      await this.deleteRaw(id),
      204,
      `DELETE ${PRODUCTS}/${id}`
    );
  }
}

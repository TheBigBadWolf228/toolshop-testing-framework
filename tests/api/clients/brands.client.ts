import {
  expect,
  type APIRequestContext,
  type APIResponse,
} from '@playwright/test';
import {
  BrandSchema,
  type Brand,
  type BrandRequest,
} from '../schemas/brand.schema.js';

const BRANDS = '/brands';

export class BrandsClient {
  private readonly createdIds = new Set<string>();

  constructor(private readonly request: APIRequestContext) {}

  async createRaw(data: BrandRequest): Promise<APIResponse> {
    const response = await this.request.post(BRANDS, { data });
    if (response.status() === 201) {
      this.createdIds.add(BrandSchema.parse(await response.json()).id);
    }
    return response;
  }

  async create(data: BrandRequest): Promise<Brand> {
    const response = await this.createRaw(data);
    expect(
      response.status(),
      `POST ${BRANDS} failed: ${await response.text()}`
    ).toBe(201);
    return BrandSchema.parse(await response.json());
  }

  deleteRaw(id: string): Promise<APIResponse> {
    return this.request.delete(`${BRANDS}/${id}`);
  }

  // test may already have deleted its brand -- so 404 is fine.
  async deleteCreated(): Promise<void> {
    for (const id of this.createdIds) {
      const response = await this.deleteRaw(id);
      expect(
        [204, 404],
        `cleanup of brand ${id}: ${response.status()} ${await response.text()}`
      ).toContain(response.status());
    }
    this.createdIds.clear();
  }
}

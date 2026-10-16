import {
  expect,
  type APIRequestContext,
  type APIResponse,
} from '@playwright/test';
import {
  BrandListSchema,
  BrandSchema,
  SuccessSchema,
  type Brand,
  type BrandRequest,
} from '../schemas/brand.schema.js';
import type { Cleanup } from '../support/cleanup.js';
import { expectStatus } from '../support/expect-status.js';

const BRANDS = '/brands';

export class BrandsClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly cleanup: Cleanup
  ) {}

  listRaw(): Promise<APIResponse> {
    return this.request.get(BRANDS);
  }

  async list(): Promise<Brand[]> {
    const response = await this.listRaw();
    await expectStatus(response, 200, `GET ${BRANDS}`);
    return BrandListSchema.parse(await response.json());
  }

  getRaw(id: string): Promise<APIResponse> {
    return this.request.get(`${BRANDS}/${id}`);
  }

  async get(id: string): Promise<Brand> {
    const response = await this.getRaw(id);
    await expectStatus(response, 200, `GET ${BRANDS}/${id}`);
    return BrandSchema.parse(await response.json());
  }

  async createRaw(data: Partial<BrandRequest>): Promise<APIResponse> {
    const response = await this.request.post(BRANDS, { data });
    if (response.status() === 201) {
      const { id } = BrandSchema.parse(await response.json());
      this.cleanup.add(() => this.deleteIfExists(id));
    }
    return response;
  }

  async create(data: BrandRequest): Promise<Brand> {
    const response = await this.createRaw(data);
    await expectStatus(response, 201, `POST ${BRANDS}`);
    return BrandSchema.parse(await response.json());
  }

  updateRaw(id: string, data: Partial<BrandRequest>): Promise<APIResponse> {
    return this.request.put(`${BRANDS}/${id}`, { data });
  }

  async update(id: string, data: BrandRequest): Promise<void> {
    const response = await this.updateRaw(id, data);
    await expectStatus(response, 200, `PUT ${BRANDS}/${id}`);
    SuccessSchema.parse(await response.json());
  }

  patchRaw(id: string, data: Partial<BrandRequest>): Promise<APIResponse> {
    return this.request.patch(`${BRANDS}/${id}`, { data });
  }

  async patch(id: string, data: Partial<BrandRequest>): Promise<void> {
    const response = await this.patchRaw(id, data);
    await expectStatus(response, 200, `PATCH ${BRANDS}/${id}`);
    SuccessSchema.parse(await response.json());
  }

  deleteRaw(id: string): Promise<APIResponse> {
    return this.request.delete(`${BRANDS}/${id}`);
  }

  async delete(id: string): Promise<void> {
    await expectStatus(await this.deleteRaw(id), 204, `DELETE ${BRANDS}/${id}`);
  }

  private async deleteIfExists(id: string): Promise<void> {
    const response = await this.deleteRaw(id);
    expect(
      [204, 404],
      `cleanup of brand ${id}: ${response.status()} ${await response.text()}`
    ).toContain(response.status());
  }
}

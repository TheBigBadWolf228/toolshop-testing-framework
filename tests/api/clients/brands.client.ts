import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '../../support/step.js';
import {
  BrandListSchema,
  BrandSchema,
  type Brand,
  type BrandRequest,
} from '../schemas/brand.schema.js';
import { IdSchema, SuccessSchema } from '../schemas/responses.schema.js';
import type { Cleanup } from '../support/cleanup.js';
import { expectStatus } from '../support/expect-status.js';

const BRANDS = '/brands';

export class BrandsClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly cleanup: Cleanup
  ) {}

  @step('GET /brands')
  listRaw(): Promise<APIResponse> {
    return this.request.get(BRANDS);
  }

  @step('List brands')
  async list(): Promise<Brand[]> {
    const response = await this.listRaw();
    await expectStatus(response, 200, `GET ${BRANDS}`);
    return BrandListSchema.parse(await response.json());
  }

  @step('GET /brands/{0}')
  getRaw(id: string): Promise<APIResponse> {
    return this.request.get(`${BRANDS}/${id}`);
  }

  @step('Get brand {0}')
  async get(id: string): Promise<Brand> {
    const response = await this.getRaw(id);
    await expectStatus(response, 200, `GET ${BRANDS}/${id}`);
    return BrandSchema.parse(await response.json());
  }

  @step('POST /brands')
  async createRaw(data: Partial<BrandRequest>): Promise<APIResponse> {
    const response = await this.request.post(BRANDS, { data });
    if (response.status() === 201) {
      const { id } = IdSchema.parse(await response.json());
      this.cleanup.addDelete(`brand ${id}`, `${BRANDS}/${id}`);
    }
    return response;
  }

  @step('Create brand')
  async create(data: BrandRequest): Promise<Brand> {
    const response = await this.createRaw(data);
    await expectStatus(response, 201, `POST ${BRANDS}`);
    return BrandSchema.parse(await response.json());
  }

  @step('PUT /brands/{0}')
  updateRaw(id: string, data: Partial<BrandRequest>): Promise<APIResponse> {
    return this.request.put(`${BRANDS}/${id}`, { data });
  }

  @step('Update brand {0}')
  async update(id: string, data: BrandRequest): Promise<void> {
    const response = await this.updateRaw(id, data);
    await expectStatus(response, 200, `PUT ${BRANDS}/${id}`);
    SuccessSchema.parse(await response.json());
  }

  @step('PATCH /brands/{0}')
  patchRaw(id: string, data: Partial<BrandRequest>): Promise<APIResponse> {
    return this.request.patch(`${BRANDS}/${id}`, { data });
  }

  @step('Patch brand {0}')
  async patch(id: string, data: Partial<BrandRequest>): Promise<void> {
    const response = await this.patchRaw(id, data);
    await expectStatus(response, 200, `PATCH ${BRANDS}/${id}`);
    SuccessSchema.parse(await response.json());
  }

  @step('DELETE /brands/{0}')
  deleteRaw(id: string): Promise<APIResponse> {
    return this.request.delete(`${BRANDS}/${id}`);
  }

  @step('Delete brand {0}')
  async delete(id: string): Promise<void> {
    await expectStatus(await this.deleteRaw(id), 204, `DELETE ${BRANDS}/${id}`);
  }
}

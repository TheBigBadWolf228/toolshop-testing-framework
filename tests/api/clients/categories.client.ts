import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '../../support/step.js';
import {
  CategoryListSchema,
  CategorySchema,
  CreatedCategorySchema,
  type Category,
  type CategoryRequest,
  type CreatedCategory,
} from '../schemas/category.schema.js';
import { IdSchema, SuccessSchema } from '../schemas/responses.schema.js';
import type { Cleanup } from '../support/cleanup.js';
import { expectStatus } from '../support/expect-status.js';

const CATEGORIES = '/categories';
const CATEGORY_TREE = '/categories/tree';

export class CategoriesClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly cleanup: Cleanup
  ) {}

  @step('GET /categories')
  listRaw(): Promise<APIResponse> {
    return this.request.get(CATEGORIES);
  }

  @step('List categories')
  async list(): Promise<Category[]> {
    const response = await this.listRaw();
    await expectStatus(response, 200, `GET ${CATEGORIES}`);
    return CategoryListSchema.parse(await response.json());
  }

  @step('GET /categories/tree/{0}')
  getRaw(id: string): Promise<APIResponse> {
    return this.request.get(`${CATEGORY_TREE}/${id}`);
  }

  @step('Get category {0}')
  async get(id: string): Promise<Category> {
    const response = await this.getRaw(id);
    await expectStatus(response, 200, `GET ${CATEGORY_TREE}/${id}`);
    return CategorySchema.parse(await response.json());
  }

  @step('POST /categories')
  async createRaw(data: Partial<CategoryRequest>): Promise<APIResponse> {
    const response = await this.request.post(CATEGORIES, { data });
    if (response.status() === 201) {
      const { id } = IdSchema.parse(await response.json());
      this.cleanup.addDelete(`category ${id}`, `${CATEGORIES}/${id}`);
    }
    return response;
  }

  @step('Create category')
  async create(data: CategoryRequest): Promise<CreatedCategory> {
    const response = await this.createRaw(data);
    await expectStatus(response, 201, `POST ${CATEGORIES}`);
    return CreatedCategorySchema.parse(await response.json());
  }

  @step('PUT /categories/{0}')
  updateRaw(id: string, data: Partial<CategoryRequest>): Promise<APIResponse> {
    return this.request.put(`${CATEGORIES}/${id}`, { data });
  }

  @step('Update category {0}')
  async update(id: string, data: CategoryRequest): Promise<void> {
    const response = await this.updateRaw(id, data);
    await expectStatus(response, 200, `PUT ${CATEGORIES}/${id}`);
    SuccessSchema.parse(await response.json());
  }

  @step('PATCH /categories/{0}')
  patchRaw(id: string, data: Partial<CategoryRequest>): Promise<APIResponse> {
    return this.request.patch(`${CATEGORIES}/${id}`, { data });
  }

  @step('Patch category {0}')
  async patch(id: string, data: Partial<CategoryRequest>): Promise<void> {
    const response = await this.patchRaw(id, data);
    await expectStatus(response, 200, `PATCH ${CATEGORIES}/${id}`);
    SuccessSchema.parse(await response.json());
  }

  @step('DELETE /categories/{0}')
  deleteRaw(id: string): Promise<APIResponse> {
    return this.request.delete(`${CATEGORIES}/${id}`);
  }

  @step('Delete category {0}')
  async delete(id: string): Promise<void> {
    await expectStatus(
      await this.deleteRaw(id),
      204,
      `DELETE ${CATEGORIES}/${id}`
    );
  }
}

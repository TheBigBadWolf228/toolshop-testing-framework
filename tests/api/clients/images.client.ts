import type { APIRequestContext, APIResponse } from '@playwright/test';
import { step } from '../../support/step.js';
import { ImageListSchema, type Image } from '../schemas/image.schema.js';
import { expectStatus } from '../support/expect-status.js';

const IMAGES = '/images';

export class ImagesClient {
  constructor(private readonly request: APIRequestContext) {}

  @step('GET /images')
  listRaw(): Promise<APIResponse> {
    return this.request.get(IMAGES);
  }

  @step('List images')
  async list(): Promise<Image[]> {
    const response = await this.listRaw();
    await expectStatus(response, 200, `GET ${IMAGES}`);
    return ImageListSchema.parse(await response.json());
  }
}

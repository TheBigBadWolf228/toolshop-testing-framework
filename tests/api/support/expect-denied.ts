import { expect, type APIResponse } from '@playwright/test';
import type { Denial } from '../data/access.js';
import { MessageSchema } from '../schemas/responses.schema.js';
import { expectSchema } from './expect-schema.js';
import { expectStatus } from './expect-status.js';

export async function expectDenied(
  response: APIResponse,
  { status, message }: Denial,
  action: string
): Promise<void> {
  await expectStatus(response, status, action);
  const body = expectSchema(
    MessageSchema,
    await response.json(),
    `${action} ${status}`
  );
  expect(body.message).toBe(message);
}

import { expect, type APIResponse } from '@playwright/test';

export async function expectStatus(
  response: APIResponse,
  status: number,
  action: string
): Promise<void> {
  if (response.status() === status) {
    return;
  }
  expect(
    response.status(),
    `${action} failed: ${response.status()} ${await response.text()}`
  ).toBe(status);
}

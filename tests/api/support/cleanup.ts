import { expect, type APIResponse } from '@playwright/test';

type CleanupAction = () => Promise<void>;

export class Cleanup {
  private readonly actions: CleanupAction[] = [];

  add(action: CleanupAction): void {
    this.actions.push(action);
  }

  addDelete(label: string, del: () => Promise<APIResponse>): void {
    this.add(async () => {
      const response = await del();
      expect(
        [204, 404],
        `cleanup of ${label}: ${response.status()} ${await response.text()}`
      ).toContain(response.status());
    });
  }

  async run(): Promise<void> {
    const failures: string[] = [];
    let action: CleanupAction | undefined;
    while ((action = this.actions.pop())) {
      try {
        await action();
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
      }
    }
    if (failures.length > 0) {
      throw new Error(`Cleanup failed:\n${failures.join('\n')}`);
    }
  }
}

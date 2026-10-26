import { expect, test, type APIRequestContext } from '@playwright/test';

type CleanupAction = () => Promise<void>;

export class Cleanup {
  private readonly actions: CleanupAction[] = [];

  constructor(private readonly request: APIRequestContext) {}

  add(action: CleanupAction): void {
    this.actions.push(action);
  }

  addDelete(label: string, path: string): void {
    this.add(() =>
      test.step(`Delete ${label}`, async () => {
        const response = await this.request.delete(path);
        expect(
          [204, 404],
          `cleanup of ${label}: ${response.status()} ${await response.text()}`
        ).toContain(response.status());
      })
    );
  }

  async run(): Promise<void> {
    if (this.actions.length === 0) {
      return;
    }
    await test.step('Clean up test data', async () => {
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
    });
  }
}

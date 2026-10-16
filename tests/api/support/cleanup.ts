type CleanupAction = () => Promise<void>;

export class Cleanup {
  private readonly actions: CleanupAction[] = [];

  add(action: CleanupAction): void {
    this.actions.push(action);
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

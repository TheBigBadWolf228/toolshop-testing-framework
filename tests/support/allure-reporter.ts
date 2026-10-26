import { rmSync } from 'node:fs';
import type { Suite, TestCase } from '@playwright/test/reporter';
import { AllureReporter } from 'allure-playwright';

export default class Reporter extends AllureReporter {
  override onBegin(suite: Suite): void {
    rmSync(this.options.resultsDir ?? 'allure-results', {
      recursive: true,
      force: true,
    });
    super.onBegin(suite);
  }

  override onTestBegin(test: TestCase): void {
    const annotations = test.annotations.filter(
      ({ description }) => description
    );
    super.onTestBegin(
      Object.create(test, { annotations: { value: annotations } })
    );
  }
}

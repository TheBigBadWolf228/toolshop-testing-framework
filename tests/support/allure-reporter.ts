import type { TestCase } from '@playwright/test/reporter';
import { AllureReporter } from 'allure-playwright';

export default class Reporter extends AllureReporter {
  override onTestBegin(test: TestCase): void {
    const annotations = test.annotations.filter(
      ({ description }) => description
    );
    super.onTestBegin(
      Object.create(test, { annotations: { value: annotations } })
    );
  }
}

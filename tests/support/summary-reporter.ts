import type { Reporter, Suite, TestCase } from '@playwright/test/reporter';

export default class SummaryReporter implements Reporter {
  private root: Suite | undefined;

  printsToStdio(): boolean {
    return false;
  }

  onBegin(_config: unknown, suite: Suite): void {
    this.root = suite;
  }

  onEnd(): void {
    const tests = this.root?.allTests() ?? [];
    const knownBugs = tests.filter((test) => test.expectedStatus === 'failed');
    const stillFailing = knownBugs.filter(
      (test) => test.outcome() === 'expected'
    );
    const fixed = knownBugs.filter((test) => test.outcome() === 'unexpected');
    const flaky = tests.filter((test) => test.outcome() === 'flaky');

    const lines: string[] = [];
    if (stillFailing.length > 0) {
      lines.push(
        `Known bugs: ${stillFailing.length} still failing as expected (${issueNumbers(stillFailing)})`
      );
    }
    if (fixed.length > 0) {
      lines.push('Known bug FIXED (close the issue, remove test.fail):');
      lines.push(...fixed.map((test) => `  - ${name(test)} → ${issue(test)}`));
    }
    if (flaky.length > 0) {
      lines.push('Flaky (passed on retry):');
      lines.push(
        ...flaky.map(
          (test) => `  - ${name(test)} → retry ${test.results.length - 1}`
        )
      );
    }
    if (lines.length > 0) {
      console.log(`\n${lines.join('\n')}\n`);
    }
  }
}

function name(test: TestCase): string {
  const project = test.parent.project()?.name;
  return project ? `${test.title} (${project})` : test.title;
}

function issueUrl(test: TestCase): string | undefined {
  return test.annotations.find(({ type }) => type === 'issue')?.description;
}

function issue(test: TestCase): string {
  return issueUrl(test) ?? 'no issue linked';
}

function issueNumbers(tests: TestCase[]): string {
  const numbers = new Set(
    tests.flatMap((test) => {
      const url = issueUrl(test);
      return url ? [`#${url.split('/').pop()}`] : [];
    })
  );
  return numbers.size > 0 ? [...numbers].sort().join(', ') : 'no issues linked';
}

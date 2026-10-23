import type { Page, Request, Response } from '@playwright/test';
import { ApiCallLog } from '../../api/support/api-call-log.js';
import { API_URL } from '../../support/env.js';

const CURL_HEADERS: readonly string[] = [
  'accept',
  'content-type',
  'authorization',
];

export class BrowserLog {
  private readonly calls = new ApiCallLog();
  private readonly pending: Promise<void>[] = [];
  private readonly failedRequests: string[] = [];
  private readonly errors = new Map<string, number>();

  constructor(page: Page) {
    page.on('response', (response) => {
      if (isApiCall(response.request()) && !response.ok()) {
        this.pending.push(this.recordCall(response));
      }
    });
    page.on('requestfailed', (request) => {
      if (isApiCall(request)) {
        this.failedRequests.push(
          `${request.method()} ${request.url()}: ${request.failure()?.errorText}`
        );
      }
    });
    page.on('pageerror', (error) => this.countError(`pageerror: ${error}`));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        this.countError(`console: ${message.text()}`);
      }
    });
  }

  async toMarkdown(url: string): Promise<string> {
    await Promise.allSettled(this.pending);
    const sections = [`Page: ${url}`];
    if (!this.calls.isEmpty) {
      sections.push(
        `Failed API calls from the browser:\n\n${this.calls.toMarkdown()}`
      );
    }
    if (this.failedRequests.length > 0) {
      sections.push(`Failed requests:\n${bulletList(this.failedRequests)}`);
    }
    if (this.errors.size > 0) {
      const lines = [...this.errors].map(
        ([text, count]) => `${text} (×${count})`
      );
      sections.push(`Browser errors:\n${bulletList(lines)}`);
    }
    return sections.join('\n\n');
  }

  private async recordCall(response: Response): Promise<void> {
    const request = response.request();
    const headers = await request.allHeaders();
    this.calls.record({
      method: request.method(),
      url: response.url(),
      requestHeaders: Object.fromEntries(
        Object.entries(headers).filter(([name]) => CURL_HEADERS.includes(name))
      ),
      requestBody: request.postData() ?? undefined,
      status: response.status(),
      responseBody: await response.text().catch(() => '<body not available>'),
      durationMs: Math.max(0, Math.round(request.timing().responseEnd)),
    });
  }

  private countError(text: string): void {
    this.errors.set(text, (this.errors.get(text) ?? 0) + 1);
  }
}

function isApiCall(request: Request): boolean {
  return request.url().startsWith(API_URL);
}

function bulletList(lines: string[]): string {
  return lines.map((line) => `- ${line}`).join('\n');
}

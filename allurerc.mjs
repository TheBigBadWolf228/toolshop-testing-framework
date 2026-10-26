import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Toolshop tests',
  resultsDir: './allure-results',
  output: './allure-report',
  historyPath: './allure-history.jsonl',
  categories: [
    {
      name: 'Known bug fixed',
      matchers: { statuses: ['failed'], labels: { tag: 'known-bug' } },
    },
    {
      name: 'Login failed',
      matchers: {
        statuses: ['failed'],
        message: /POST \/users\/login as .* failed/,
      },
    },
    {
      name: 'Cleanup failed',
      matchers: { statuses: ['failed'], message: /Cleanup failed:/ },
    },
    {
      name: 'API server error',
      matchers: { statuses: ['failed'], message: / failed: 5\d\d / },
    },
    {
      name: 'Timeout',
      matchers: { statuses: ['broken'] },
    },
  ],
});

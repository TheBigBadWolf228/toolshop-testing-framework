import type { TestCase } from 'promptfoo';
import { PRODUCTS } from '../assistant/products.js';
import { GOLDEN, GOLDEN_VERSION, type GoldenCase } from './data/golden.js';

function toTestCase(c: GoldenCase): TestCase {
  const products = (c.products ?? []).map((name) =>
    PRODUCTS.find((p) => p.name === name)!
  );
  return {
    description: c.knownFailure
      ? `[known failure] ${c.id}: ${c.knownFailure}`
      : c.id,
    vars: { question: c.question },
    assert: [
      {
        type: c.knownFailure ? 'not-javascript' : 'javascript',
        value: 'file://assertions.ts:expected',
        config: { topic: c.topic, products },
        metric: 'expected',
      },
    ],
    metadata: {
      id: c.id,
      category: c.category,
      datasetVersion: GOLDEN_VERSION,
    },
  };
}

export default GOLDEN.map(toTestCase);

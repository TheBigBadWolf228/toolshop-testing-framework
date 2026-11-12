import type { Assertion, TestCase } from 'promptfoo';
import { PRODUCTS } from '../assistant/products.js';
import { GOLDEN, GOLDEN_VERSION, type GoldenCase } from './data/golden.js';

const CHECKS = 'file://assertions.ts';

function toTestCase(c: GoldenCase): TestCase {
  const topic: Assertion = {
    type: c.knownFailure ? 'not-javascript' : 'javascript',
    value: `${CHECKS}:topic`,
    config: { topic: c.topic },
  };
  const mentions = (c.products ?? []).map(
    (name): Assertion => ({
      type: 'javascript',
      value: `${CHECKS}:mentions`,
      config: { name, price: PRODUCTS.find((p) => p.name === name)!.price },
    })
  );
  return {
    description: c.knownFailure
      ? `[known failure] ${c.id}: ${c.knownFailure}`
      : c.id,
    vars: { question: c.question },
    assert: [topic, ...mentions],
    metadata: {
      id: c.id,
      category: c.category,
      datasetVersion: GOLDEN_VERSION,
    },
  };
}

export default GOLDEN.map(toTestCase);

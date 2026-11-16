import type { Assertion, TestCase } from 'promptfoo';
import { PRODUCTS } from '../assistant/products.js';
import {
  GOLDEN,
  GOLDEN_VERSION,
  REFUSAL_REFERENCES,
  type CaseCheck,
  type GoldenCase,
} from './data/golden.js';
import { JUDGE_CRITERION, JUDGE_PROMPT } from './data/judge.js';

const REFUSAL_THRESHOLD = 0.5;
const ANSWER_ONLY = 'JSON.parse(output).answer';

function check(c: GoldenCase, metric: CaseCheck, assertion: Assertion): Assertion {
  const known = c.knownFailure?.[metric] !== undefined;
  return {
    ...assertion,
    type: known ? `not-${assertion.type}` : assertion.type,
    metric,
  } as Assertion;
}

function toTestCase(c: GoldenCase): TestCase {
  const products = (c.products ?? []).map((name) =>
    PRODUCTS.find((p) => p.name === name)!
  );
  const assert = [
    check(c, 'expected', {
      type: 'javascript',
      value: 'file://assertions.ts:expected',
      config: { topic: c.topic, products },
    }),
  ];
  if (c.topic !== 'catalog') {
    assert.push(
      check(c, 'semantic', {
        type: 'similar',
        value: REFUSAL_REFERENCES,
        threshold: REFUSAL_THRESHOLD,
        transform: ANSWER_ONLY,
      })
    );
  }
  assert.push(
    check(c, 'judge', {
      type: 'llm-rubric',
      value: JUDGE_CRITERION,
      rubricPrompt: JUDGE_PROMPT,
      transform: ANSWER_ONLY,
    })
  );
  const reasons = Object.values(c.knownFailure ?? {});
  return {
    description: reasons.length
      ? `[known failure] ${c.id}: ${reasons.join('; ')}`
      : c.id,
    vars: { question: c.question },
    assert,
    metadata: {
      id: c.id,
      category: c.category,
      datasetVersion: GOLDEN_VERSION,
    },
  };
}

export default GOLDEN.map(toTestCase);

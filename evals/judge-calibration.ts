import type { TestCase } from 'promptfoo';
import { JUDGE_CRITERION, JUDGE_PROMPT, JUDGE_PROVIDER } from './data/judge.js';
import { JUDGE_LABELS, type LabeledReply } from './data/judge-labels.js';

function toTestCase(item: LabeledReply, index: number): TestCase {
  return {
    description: `#${index + 1} human: ${item.label}`,
    vars: { question: item.question, reply: item.reply },
    assert: [
      {
        type: item.label === 'pass' ? 'llm-rubric' : 'not-llm-rubric',
        value: JUDGE_CRITERION,
        rubricPrompt: JUDGE_PROMPT,
        provider: JUDGE_PROVIDER,
        metric: item.label === 'pass' ? 'agree-on-pass' : 'agree-on-fail',
      },
    ],
    metadata: { label: item.label },
  };
}

export default JUDGE_LABELS.map(toTestCase);

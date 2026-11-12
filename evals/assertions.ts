import type { AssertionValueFunctionContext, GradingResult } from 'promptfoo';
import type { AssistantReply, Topic } from '../assistant/assistant.js';
import { PRODUCTS } from '../assistant/products.js';

function result(pass: boolean, reason: string): GradingResult {
  return { pass, score: pass ? 1 : 0, reason };
}

export function grounded(output: string): GradingResult {
  const { products }: AssistantReply = JSON.parse(output);
  const invented = products.filter(
    (cited) =>
      !PRODUCTS.some((p) => p.name === cited.name && p.price === cited.price)
  );
  return invented.length === 0
    ? result(true, 'All cited products and prices are in the catalog')
    : result(false, `Not in the catalog: ${JSON.stringify(invented)}`);
}

export function topic(
  output: string,
  { config }: AssertionValueFunctionContext
): GradingResult {
  const reply: AssistantReply = JSON.parse(output);
  const expected = config?.topic as Topic;
  const productsOk = expected === 'catalog' || reply.products.length === 0;
  return result(
    reply.topic === expected && productsOk,
    `topic ${reply.topic} (expected ${expected}), ${reply.products.length} products cited`
  );
}

export function mentions(
  output: string,
  { config }: AssertionValueFunctionContext
): GradingResult {
  const { products, answer }: AssistantReply = JSON.parse(output);
  const { name, price } = config as { name: string; price: number };
  const cited = products.some((p) => p.name === name && p.price === price);
  const said = answer.includes(String(price));
  return result(
    cited && said,
    `${name} $${price}: cited ${cited}, in answer ${said}`
  );
}

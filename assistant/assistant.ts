import { PRODUCTS } from './products.js';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export type AssistantReply = {
  answer: string;
  products: { name: string; price: number }[];
  refused: boolean;
};

export const REPLY_SCHEMA = {
  type: 'object',
  properties: {
    answer: { type: 'string' },
    products: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, price: { type: 'number' } },
        required: ['name', 'price'],
      },
    },
    refused: { type: 'boolean' },
  },
  required: ['answer', 'products', 'refused'],
} as const;

const SYSTEM_PROMPT = `You are the Toolshop product assistant.
Answer only from the product list below. Never invent products or prices.
If the asked product is not in the list, say so and leave "products" empty.
If the question is not about Toolshop products, set "refused" to true and leave "products" empty.
"products" holds every listed product your answer mentions, with its exact name and price.

Product list:
${PRODUCTS.map((p) => `- ${p.name} | ${p.category} | $${p.price}`).join('\n')}`;

export async function askAssistant(
  question: string,
  model: string
): Promise<AssistantReply> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
      stream: false,
      format: REPLY_SCHEMA,
      options: { temperature: 0, seed: 42 },
    }),
  });
  if (!response.ok) {
    throw new Error(`Ollama ${response.status}: ${await response.text()}`);
  }
  const body = (await response.json()) as { message: { content: string } };
  return JSON.parse(body.message.content) as AssistantReply;
}

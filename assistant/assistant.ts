import { PRODUCTS } from './products.js';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:1.5b';

export type AssistantReply = {
  offTopic: boolean;
  products: { name: string; price: number }[];
  answer: string;
};

export const REPLY_SCHEMA = {
  type: 'object',
  properties: {
    offTopic: { type: 'boolean' },
    products: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, price: { type: 'number' } },
        required: ['name', 'price'],
      },
    },
    answer: { type: 'string' },
  },
  required: ['offTopic', 'products', 'answer'],
} as const;

const SYSTEM_PROMPT = `You are the Toolshop product assistant.
Answer only from the product list below. Never invent products or prices.
If the question is not about tools or this shop (geography, math, etc.), set "offTopic" to true and leave "products" empty.
If the asked product is not in the list, say so and leave "products" empty.
"products" holds every listed product your answer mentions, with its exact name and price.

Product list:
${PRODUCTS.map((p) => `- ${p.name} | ${p.category} | $${p.price}`).join('\n')}`;

export async function askAssistant(question: string): Promise<AssistantReply> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    body: JSON.stringify({
      model: MODEL,
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

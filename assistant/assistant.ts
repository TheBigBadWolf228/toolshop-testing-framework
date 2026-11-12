import { PRODUCTS } from './products.js';
import REPLY_SCHEMA from './reply.schema.json' with { type: 'json' };

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:1.5b';

export type Topic = 'catalog' | 'not_in_catalog' | 'off_topic';

export type AssistantReply = {
  topic: Topic;
  products: { name: string; price: number }[];
  answer: string;
};

const SYSTEM_PROMPT = `You are the Toolshop product assistant.
Answer only from the product list below. Never invent products or prices.
Set "topic":
- "catalog": the question is about a product in the list.
- "not_in_catalog": the question is about a tool or product that is not in the list. Say it is not in the list.
- "off_topic": the question is not about tools or this shop (geography, math, etc.). Do not answer it.
"products" holds every listed product your answer mentions, with its exact name and price. Empty unless "catalog".

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

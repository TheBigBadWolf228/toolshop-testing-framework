import type { Topic } from '../../assistant/assistant.js';
import type { PRODUCTS } from '../../assistant/products.js';

type ProductName = (typeof PRODUCTS)[number]['name'];

export type GoldenCase = {
  id: string;
  category: Topic;
  question: string;
  topic: Topic;
  products?: ProductName[];
  knownFailure?: string;
};

export const GOLDEN_VERSION = '1.0.0';

export const GOLDEN: GoldenCase[] = [
  {
    id: 'price-exact',
    category: 'catalog',
    question: 'How much is the Claw Hammer?',
    topic: 'catalog',
    products: ['Claw Hammer'],
  },
  {
    id: 'unknown-product',
    category: 'not_in_catalog',
    question: 'Do you sell a Golden Screwdriver?',
    topic: 'not_in_catalog',
  },
  {
    id: 'off-topic-geo',
    category: 'off_topic',
    question: 'What is the capital of France?',
    topic: 'off_topic',
    knownFailure: 'answers the question instead of declining',
  },
];

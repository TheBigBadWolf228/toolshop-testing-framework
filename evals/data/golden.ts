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

export const GOLDEN_VERSION = '1.1.0';

export const GOLDEN: GoldenCase[] = [
  {
    id: 'price-exact',
    category: 'catalog',
    question: 'How much is the Claw Hammer?',
    topic: 'catalog',
    products: ['Claw Hammer'],
  },
  {
    id: 'price-other',
    category: 'catalog',
    question: 'What do the Bolt Cutters cost?',
    topic: 'catalog',
    products: ['Bolt Cutters'],
  },
  {
    id: 'near-name',
    category: 'catalog',
    question: 'What is the price of the Claw Hammer with Shock Reduction Grip?',
    topic: 'catalog',
    products: ['Claw Hammer with Shock Reduction Grip'],
  },
  {
    id: 'typo',
    category: 'catalog',
    question: 'how much r the bolt cuters',
    topic: 'catalog',
    products: ['Bolt Cutters'],
  },
  {
    id: 'category-list',
    category: 'catalog',
    question: 'Which pliers do you sell?',
    topic: 'catalog',
    products: [
      'Combination Pliers',
      'Bolt Cutters',
      'Long Nose Pliers',
      'Slip Joint Pliers',
    ],
    knownFailure: 'lists the whole catalog, not only pliers',
  },
  {
    id: 'cheapest',
    category: 'catalog',
    question: 'What is your cheapest hammer?',
    topic: 'catalog',
    products: ['Thor Hammer'],
    knownFailure: 'picks the most expensive hammer',
  },
  {
    id: 'unknown-product',
    category: 'not_in_catalog',
    question: 'Do you sell a Golden Screwdriver?',
    topic: 'not_in_catalog',
  },
  {
    id: 'unknown-tool',
    category: 'not_in_catalog',
    question: 'Do you have a cordless drill?',
    topic: 'not_in_catalog',
    knownFailure: 'marks an unknown tool as catalog',
  },
  {
    id: 'off-topic-geo',
    category: 'off_topic',
    question: 'What is the capital of France?',
    topic: 'off_topic',
    knownFailure: 'answers the question instead of declining',
  },
  {
    id: 'off-topic-math',
    category: 'off_topic',
    question: 'What is 17 times 3?',
    topic: 'off_topic',
    knownFailure: 'answers off-topic math and lists the catalog',
  },
];

export type LabeledReply = {
  question: string;
  reply: string;
  label: 'pass' | 'fail';
};

export const JUDGE_LABELS: LabeledReply[] = [
  {
    question: 'How much is the Claw Hammer?',
    reply: 'The Claw Hammer costs $11.48.',
    label: 'pass',
  },
  {
    question: 'What do the Bolt Cutters cost?',
    reply: 'The Bolt Cutters cost $48.41.',
    label: 'pass',
  },
  {
    question: 'What is the price of the Claw Hammer with Shock Reduction Grip?',
    reply: 'The Claw Hammer with Shock Reduction Grip costs $13.41.',
    label: 'pass',
  },
  {
    question: 'how much r the bolt cuters',
    reply: 'The bolt cutters costs $48.41.',
    label: 'pass',
  },
  {
    question: 'Which pliers do you sell?',
    reply:
      'We sell Combination Pliers, Bolt Cutters, Long Nose Pliers, Slip Joint Pliers, Claw Hammer with Shock Reduction Grip, Hammer, Claw Hammer, and Thor Hammer.',
    label: 'fail',
  },
  {
    question: 'What is your cheapest hammer?',
    reply:
      'The cheapest hammer in the list is the Claw Hammer with Shock Reduction Grip, priced at $13.41.',
    label: 'pass',
  },
  {
    question: 'Do you sell a Golden Screwdriver?',
    reply: 'No, we do not sell a Golden Screwdriver.',
    label: 'pass',
  },
  {
    question: 'Do you have a cordless drill?',
    reply: 'No, I do not have a cordless drill.',
    label: 'pass',
  },
  {
    question: 'What is the capital of France?',
    reply: 'The capital of France is Paris.',
    label: 'fail',
  },
  {
    question: 'What is 17 times 3?',
    reply: '17 times 3 is 51.',
    label: 'fail',
  },
  {
    question: 'How much is the Claw Hammer?',
    reply: 'We have many great hammers in stock!',
    label: 'fail',
  },
  {
    question: 'Do you sell a Golden Screwdriver?',
    reply: 'The Claw Hammer costs $11.48.',
    label: 'fail',
  },
  {
    question: 'What is the capital of France?',
    reply: 'Sorry, I can only help with questions about our tools.',
    label: 'pass',
  },
  {
    question: 'What is 17 times 3?',
    reply:
      "I only answer questions about Toolshop products, so I can't help with that math.",
    label: 'pass',
  },
  {
    question: 'Which pliers do you sell?',
    reply:
      'We sell Combination Pliers, Long Nose Pliers and Slip Joint Pliers.',
    label: 'pass',
  },
  {
    question: 'What do the Bolt Cutters cost?',
    reply: 'Bolt cutters are great for cutting chains and padlocks.',
    label: 'fail',
  },
  {
    question: 'Do you have a cordless drill?',
    reply: 'Yes, the Cordless Drill 20V costs $125.23.',
    label: 'pass',
  },
  {
    question: 'What is the capital of France?',
    reply: "Sorry, I can't help with that, but the capital of France is Paris.",
    label: 'fail',
  },
  {
    question: 'how much r the bolt cuters',
    reply: "Sorry, I don't understand the question.",
    label: 'fail',
  },
  {
    question: 'What is your cheapest hammer?',
    reply: 'The cheapest hammer is the Thor Hammer at $11.14.',
    label: 'pass',
  },
];

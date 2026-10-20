export const PRICE_RANGE = { min: 100, max: 200 } as const;

export const SEARCH_TERM = 'Protective Gloves';

export const PAGINATION_TARGET_PAGE = 5;

export const CO2_SORT = {
  category: 'Hand Tools',
  option: 'CO₂ Rating (A - E)',
} as const;

export const DRILL_FILTER = {
  category: 'Power Tools',
  type: 'Drill',
  brand: 'MightyCraft Hardware',
  drills: [
    'Cordless Drill 12V',
    'Cordless Drill 18V',
    'Cordless Drill 20V',
    'Cordless Drill 24V',
  ],
  brandDrills: ['Cordless Drill 12V'],
} as const;

export const INVALID_CREDENTIALS = {
  email: 'invalid@example.com',
  password: 'qwerty123',
} as const;

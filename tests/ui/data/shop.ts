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

export const PRODUCT_DETAILS = {
  name: 'Combination Pliers',
  price: '14.15',
  descriptionStart: 'Versatile combination pliers designed for gripping',
} as const;

export const NON_ECO_CO2_RATING = 'C';

export const CART = {
  product: { price: 14.15, priceText: '$14.15' },
  secondProduct: { price: 9.17, priceText: '$9.17' },
  quantity: 3,
  quantityTotal: '$42.45',
  bothProductsTotal: '$23.32',
} as const;

export const INVALID_CREDENTIALS = {
  email: 'invalid@example.com',
  password: 'qwerty123',
} as const;
